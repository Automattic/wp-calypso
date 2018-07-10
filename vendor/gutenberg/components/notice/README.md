Notice
======

This component is used to display notices in editor.

## Usage

To display a plain notice, pass `Notice` a string:

```jsx
<Notice status="error">
    An unknown error occurred.
</Notice>
```

For more complex markup, you can pass any JSX element:

```jsx
<Notice status="error">
    <p>An error occurred: <code>{ errorDetails }</code>.</p>
</Notice>
```

### Props

The following props are used to control the display of the component.

* `status`: (string) can be `warning` (red), `success` (green), `error` (red), `info` (yellow)
* `onRemove`: function called when dismissing the notice
* `isDismissible`: (bool) defaults to true, whether the notice should be dismissible or not
