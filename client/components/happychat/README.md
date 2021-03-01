# Happychat

Component for Happychat support chats. This component provides both:

1. A sidebar on the right side of the viewport for customers to chat with support via Happychat
2. A page rendered a /me/chat with a full page version of the chat client.

The component uses the `happychat` key of the redux store for displaying chat messages.

```js
import Happychat from 'component/happychat';

function render() {
	return <Happychat />;
}
```

## Autoscroll

Happychat uses the `./autoscroll.js` mixin to provide scroll-to-bottom functionality as chat messages are received.

## Scrollbleed

Happychat uses the `./scrollbleed.js` mixin to prevent mousewheel scroll events from scrolling DOM nodes unexpectedly (e.g. scrolling the whole page once the end of the chat has been reached).
