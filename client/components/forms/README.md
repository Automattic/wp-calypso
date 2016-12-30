Form Components
===============

This is a directory of shared form components.

### Settings Form Fields
The following form components were created as an effort to minimize duplication between site settings and me settings.

- form-button
- form-buttons-bar
- form-checkbox
- form-fieldset
- form-label
- form-legend
- form-radio
- form-select
- form-setting-explanation
- form-text-input
- form-textarea

The component jsx files are wrappers that ensure our classes are added to each form field. Each form field component also contains a `style.scss` file in its directory for styling. These stylesheets are included in `/assets/stylesheets/_components.scss`.

### FormSectionHeading
The `FormSectionHeading` component allows you to add a section header to your settings form.

### FormInputValidation
The `FormInputValidation` component is used to display a validation notice to the user. You can use it like this:

<FormInputValidation isError={ true } text="Usernames can only contain lowercase letters (a-z) and numbers." />
<FormInputValidation text="That username is valid." />

### MultiCheckbox

[See README.md for MultiCheckbox](multi-checkbox/README.md)

### SelectOptGroups
`SelectOptGroups` allows you to pass structured data to render a select element with `<option>` elements nested inside `<optgroup>` separators. You can use it like this:

```jsx
var options = [
	{
		label: 'Group 1',
		options: [
			{
				label: 'Option 1',
				value: 1
			},
			{
				label: 'Option 2',
				value: 2
			}
		]
	},
	{
		label: 'Group 2',
		options: [
			{
				label: 'Option 3',
				value: 3
			},
			{
				label: 'Option 4',
				value: 4
			}
		]
	}
],
initialSelected = 3;

<SelectOptGroups name="example" value={ initialSelected } options={ options } />
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
