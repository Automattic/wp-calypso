Checkbox
========

Checkbox is a React component used to render a checkbox input field. It is essentially an enhanced version of `<input type="checkbox" />`, using Gridicon as check mark.

## Usage

Refer to the following code snippet for a typical usage example:

```jsx
<Checkbox
	checked={ this.state.showSubtitles }
	onChange={ this._toggleShowSubtitles }>
	Show subtitles
</Checkbox>
```

## Props

Props not listed below will be passed automatically to the rendered range input element.

### `checked` (`boolean`)

A boolean indicating whether the checkbox should be checked or not, then the checkmark Gridicon is shown.

### `disabled` (`boolean`)

A boolean indicating whether the checkbox should be disabled or not.

### `onChange` (`function`)

An optional function to communicate the state change.
