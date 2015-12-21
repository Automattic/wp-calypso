# DangerousHtml

This is a component used to inject raw HTML as a string into another React
component.

Normally it's possible to use the special `dangerouslySetInnerHTML` prop of a
component to add raw HTML into that component, but the markup is injected as-is,
which means that any invalid markup will risk breaking React's virtual DOM.
(Generally this results in errors like `Invariant Violation: Expected markup to
render 15 nodes, but rendered 10`).

This component creates a tag (of the tag name matching `tag`) and uses the web
API's `innerHTML` to inject the HTML into the tag rather than using
`dangerouslySetInnerHTML`. Using JavaScript to set the HTML causes the browser
to fix any invalid markup and prevents it from breaking the renderer.

## Props

* `tag`: (Required) The tagname to use when creating the element (e.g.: `div`).
* `html`: (Required) The raw HTML string to inject as a child of the tag.
* `className`: Adds classes to the component.
