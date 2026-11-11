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
    "image": "images/room-1.svg",
    "url": "https://example.com/chat/general"
}
```

Images go in `public/images/` and are referenced with a relative path (no leading `/`).

## Native app integration

When a chatroom is tapped, the page sends a message to the `openChatroom` script message handler with this body:

```json
{ "id": "general", "name": "General", "url": "https://example.com/chat/general" }
```

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
