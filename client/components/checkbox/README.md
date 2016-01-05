Checkbox
========

Checkbox is a React component used to render a checkbox input field. It is essentially an enhanced version of `<input type="checkbox" />`, using Gridicon as check mark.

## Usage

Refer to the following code snippet for a typical usage example:

```jsx
<Checkbox
	checked={ this.state.showSubtitles }
	onChange={ this.toggleShowSubtitles }>
	Show subtitles
</Checkbox>
```

One thing to notice is the implementation differs from the HTML specification in the sense we ignore the `value` attribute and instead we use the inner content of the component.

## Props

### `checked` (`boolean`)

Whether the checkbox should be checked or not.

### `disabled` (`boolean`)

Whether the checkbox should be disabled or not.

### `onChange` (`function`)

An optional function called when the state changes.
