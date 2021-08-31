# Form Components

This is a directory of shared form components.

## Settings Form Fields

The following form components were created as an effort to minimize duplication between site settings and me settings.

- clipboard-button
- counted-textarea
- form-button
- form-buttons-bar
- form-checkbox
- form-country-select
- form-currency-input
- form-fieldset
- form-input-validation
- form-label
- form-legend
- form-password-input
- form-phone-input
- form-phone-media-input
- form-radio
- form-range
- form-section-heading
- form-select
- form-setting-explanation
- form-tel-input
- form-text-input
- form-text-input-with-action
- form-text-input-with-affixes
- form-textarea
- form-toggle
- multi-checkbox
- range
- sortable-list

The component jsx files are wrappers that ensure our classes are added to each form field. Each form field component also contains a `style.scss` file in its directory for styling. These stylesheets are included in `/assets/stylesheets/_components.scss`.

### FormSectionHeading

The `FormSectionHeading` component allows you to add a section header to your settings form.

### FormInputValidation

The `FormInputValidation` component is used to display a validation notice to the user. You can use it like this:

```jsx
<>
	<FormInputValidation
		isError
		text="Usernames can only contain lowercase letters (a-z) and numbers."
	/>
	<FormInputValidation text="That username is valid." />
</>;
```

### MultiCheckbox

[See README.md for MultiCheckbox](./multi-checkbox/README.md)

### SelectOptGroups

`SelectOptGroups` allows you to pass structured data to render a select element with `<option>` elements nested inside `<optgroup>` separators. You can use it like this:

```jsx
const options = [
	{
		label: 'Group 1',
		options: [
			{
				label: 'Option 1',
				value: 1,
			},
			{
				label: 'Option 2',
				value: 2,
			},
		],
	},
	{
		label: 'Group 2',
		options: [
			{
				label: 'Option 3',
				value: 3,
			},
			{
				label: 'Option 4',
				value: 4,
			},
		],
	},
];
const initialSelected = 3;

<SelectOptGroups name="example" value={ initialSelected } options={ options } />;
```

And this would render:

```html
<select name="example">
	<optgroup label="Group 1">
		<option value="1">Option 1</option>
		<option value="2">Option 2</option>
	</optgroup>
	<optgroup label="Group 1">
		<option value="3" selected>Option 3</option>
		<option value="4">Option 4</option>
	</optgroup>
</select>
```

Any valid jsx attributes that are passed to `<SelectOptGroup>` will also get passed to the rendered `<select>` element, so you can also pass in attributes like `className`, `onChange`, etc.

### General guidelines

- Use clear and accurate labels.
- Use sentence-style capitalization except when referring to an official/branded feature or service name (e.g. Simple Payments).
