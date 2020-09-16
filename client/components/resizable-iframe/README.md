# Resizable Iframe

Resizable Iframe is a React component for rendering an `<iframe>` element which can dynamically update its own dimensions using [`window.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage). This is useful in cases where an inline frame of an unknown size is to be displayed on the page.

## Example

The `ResizableIframe` component can be used in much the same way that you would use an `<iframe>` DOM element. Props are automatically transferred to the rendered `<iframe>`, in case you need to specify additional properties or styles.

```html
<ResizableIframe src={ myFrameUrl } frameBorder={ 0 } />
```

## Usage

To allow for resizing of the element, a `ResizableIframe` element listens for `message` events on the `window` object. If the rendered frame is not sandboxed, a script is injected in the frame to manage this behavior on your behalf. If the frame is sandboxed, any page you reference as the `src` URL is responsible for invoking this event using [`window.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage). The message should be a JSON string with an `action` value of "resize" and a numeric `width` and `height` to define the new pixel dimensions of the element.

For example, a page can trigger a resize using the following code snippet:

```javascript
if ( window.parent ) {
	window.parent.postMessage(
		JSON.stringify( {
			action: 'resize',
			width: document.body.clientWidth,
			height: document.body.clientHeight,
		} ),
		'*'
	);
}
```

## Props

### `src`

Treated as the `src` URL to be used in the rendered `<iframe>` DOM element.

### `width`

An optional fixed width value, if you don't want this to be the responsibility of the child window.

### `height`

An optional fixed height value, if you don't want this to be the responsibility of the child window.

### `onResize`

An optional function to trigger when the rendered frame has been resized.
