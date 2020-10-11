# highlight

This module searches a given html string and wraps all matching strings with a `<mark>` or a custom wrapper.

If you give a custom element as a wrapper, it will be cloned every time it is added via `cloneNode()`

## How to use

```js
const html = '<div>hello world</div>';
const highlighted = highlight( 'hello', html );
```

Will produce:

```html
<div><mark>hello</mark> world</div>
```

Using a custom highlight wrapper:

```js
const customWrapper = document.createElement( 'span' );
customWrapper.setAttribute( 'class', 'my-wrapper' );

const customHighlighted = highlight( 'hello', html, customWrapper );
```

Will produce:

```html
<div><span class="my-wrapper">hello</span> world</div>
```
