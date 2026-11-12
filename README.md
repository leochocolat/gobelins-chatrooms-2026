# Gobelins Chatrooms 2026

Hub listing the available chatrooms, meant to be displayed in a `WKWebView` inside the native iOS / macOS app.

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
