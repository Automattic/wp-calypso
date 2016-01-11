Checkbox
========

Checkbox is a React component used to render a checkbox input field. It is essentially an enhanced version of `<input type="checkbox" />`, using Gridicon as check mark. The checked state responsibility is managed in a higher order component.

## Usage

Refer to the following code snippet for a typical usage example:

```jsx
<Checkbox
	isChecked={ this.state.showSubtitles }
	onChange={ this.toggleShowSubtitles }>
	Show subtitles
</Checkbox>
```

One thing to notice is the implementation differs from the HTML specification in the sense we ignore the `value` attribute and instead we use the inner content of the component.

## Props

### `id` (`string`)

The html global attribute as a unique identifier which must be unique in the whole document.

### `name` (`string`)

The name attribute is used when sending data in a form submission.

### `isChecked` (`boolean`)

Whether the checkbox should be checked or not.

### `isDisabled` (`boolean`)

Whether the checkbox should be disabled or not.

### `onChange` (`function`)

An optional function called when the state changes.
