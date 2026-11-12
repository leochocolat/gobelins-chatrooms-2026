# Gobelins Chatrooms 2026

Hub listing the available chatrooms. It's displayed in the native iOS / macOS app (Xcode project, `WKWebView`) and in the Electron desktop app for macOS / Windows (this repo, `electron/`).

Production: https://gobelins-chartooms-2026.netlify.app/

## Development

```sh
pnpm install
pnpm dev     # local dev server
pnpm build   # outputs to dist/, to be hosted
```

## Chatrooms config

Chatrooms are listed in [`src/config/chatrooms.json`](src/config/chatrooms.json) (rebuild after any change):

```json
{
    "id": "general",
    "name": "General",
    "image": "images/general.jpg",
    "url": "https://example.com/chat/general",
    "credits": {
        "design": ["Jane Doe", "John Doe"],
        "development": ["Alex Smith"]
    }
}
```

- `image` (optional): a PNG or JPG in `public/images/`, referenced with a relative path (no leading `/`). It's shown in a 16:10 frame, so a landscape image at least ~1400px wide looks best. On `pnpm build`, it's converted to an optimized WebP in `dist/` only (see [`plugins/optimize-images.js`](plugins/optimize-images.js)); never commit WebP versions. Without an image, a placeholder photo from Unsplash is used.
- `credits` (optional): either `{ "design": [...], "development": [...] }`, displayed as two labelled lines, or a plain string displayed as is.

## Electron app (macOS / Windows)

```sh
pnpm electron:dev         # hub dev server + Electron window
pnpm electron:build:mac   # release/*.dmg (Apple Silicon + Intel)
pnpm electron:build:win   # release/*Setup*.exe (Windows x64)
```

The packaged app bundles the built hub (`dist/`). Chatrooms open over the hub with a loading screen, an error screen with **Try again**, a close button (or Escape) to go back, and "Don't show this next time" reopens the chosen chatroom at launch (saved in the app's user data folder).

- `electron/main.mjs`: window, chatroom views, remembered chatroom
- `electron/overlay.html`: loading / error screen and close button shown over a chatroom
- `electron/preload-hub.cjs`: `window.electron.openChatroom()`, used by `src/utils/native.js`
- `electron-builder.yml`: packaging config

The builds are **not signed** yet: on macOS, open the app the first time with right-click > Open; on Windows, SmartScreen asks to confirm ("More info" > "Run anyway").

Building the Windows installer on an Apple Silicon Mac needs Rosetta 2 (`softwareupdate --install-rosetta`), as electron-builder's NSIS tool is Intel only. The unpacked Windows app (`release/win-unpacked/`) is produced either way.

## Native app integration

When a chatroom is tapped, the page sends a message to the `openChatroom` script message handler with this body:

```json
{ "id": "general", "name": "General", "url": "https://example.com/chat/general", "remember": false }
```

`remember` reflects the "Don't show this next time" switch: the app saves the chatroom and opens it directly on next launch. Closing the chatroom (✕ button) forgets that choice.

If the handler isn't registered (e.g. in a regular browser), the page falls back to navigating to the chatroom `url`.

Example on the Swift side:

```swift
import WebKit

final class HubViewController: UIViewController, WKScriptMessageHandler {
    private var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        let config = WKWebViewConfiguration()
        config.userContentController.add(self, name: "openChatroom")

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(webView)

        webView.load(URLRequest(url: URL(string: "https://your-hub-url.example")!))
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "openChatroom",
              let body = message.body as? [String: Any],
              let urlString = body["url"] as? String,
              let url = URL(string: urlString) else { return }

        let name = body["name"] as? String
        // Route however you like: push a new screen with its own WKWebView, present a sheet, etc.
        print("Open chatroom \(name ?? "") at \(url)")
    }
}
```

On macOS, use `NSViewController` instead of `UIViewController`; the WebKit part is identical.

> `userContentController.add(self, name:)` retains its handler. Call `removeScriptMessageHandler(forName: "openChatroom")` when the view controller goes away to avoid a retain cycle.
