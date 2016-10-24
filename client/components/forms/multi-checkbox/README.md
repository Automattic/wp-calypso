MultiCheckbox
=============

MultiCheckbox is a React component that can be used in forms to simplify the creation of checkbox inputs where multiple values are possible.

## Example

Below is an example use for the MultiCheckbox component:

```
var options = [
	{ value: 1, label: 'One' },
	{ value: 2, label: 'Two' }
];

<MultiCheckbox name="favorite_numbers" options={ options } defaultChecked={ [ 1 ] } />
```

This code snippet will generate the following output:

```html
<div>
	<label><input type="checkbox" name="favorite_numbers[]" value="1" checked="checked"><span>One</span></label>
	<label><input type="checkbox" name="favorite_numbers[]" value="2"><span>Two</span></label>
</div>
```

## Props

### `name`

A name to be used as the name field for each checkbox generated. You do not need to suffix the name with "[]".

### `options`

An array of options, of which each is an object containing a `value` and `label` string to be displayed alongside the checkbox.

### `checked`

An array of option values to be checked in the rendered set of checkboxes.

### `defaultChecked`

If any values should be checked by default, pass these as an array using the `defaultChecked` prop.

### `onChange`

Behaves similarly to the equivalent function handler for standard input elements. This function is invoked when the set of selected checkboxes changes, and is passed a single object argument containing `value` as an array of the newly selected checkbox values.

### `disabled`

Pass `true` to set each of the rendered checkboxes as disabled.
