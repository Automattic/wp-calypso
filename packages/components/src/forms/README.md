# Form Components

This is a directory of shared form components.

## Notes about component migration

Ideally, we want to gradually migrate all shared Calypso form components from `client/components/forms` to `@automattic/components/forms`. This will allow us to share said components outside of the Calypso environment. Many more components exist in `client/components/forms`, but before using them, please consider moving them into this package.

## Settings Form Fields

The following form components were created as an effort to minimize duplication between site settings and me settings.

- form-input-validation
- form-label

The component jsx files are wrappers that ensure our classes are added to each form field. Each form field component also contains a `style.scss` file in its directory for styling.

### FormInputValidation

The `FormInputValidation` component is used to display a validation notice to the user. You can use it like this:

```jsx
<>
	<FormInputValidation
		isError
		text="Usernames can only contain lowercase letters (a-z) and numbers."
	/>
	<FormInputValidation text="That username is valid." />
</>
```

### FormLabel

The `FormLabel` component is a light wrapper around the traditional HTML label. It provides standardized styling and the ability to display "optional" and "required" subtext alongside the label. It also has options to enable styling like @wordpress/component labels.

#### Props

| Prop                  | Type    | Default | Description                                                                                                                          |
| --------------------- | ------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `optional`            | boolean | false   | Displays an "Optional" subtext next to the label.                                                                                    |
| `required`            | boolean | false   | Displays a "Required" subtext next to the label.                                                                                     |
| `hasCoreStyles`       | boolean | false   | Applies label styles matching those for core @wordpress/components labels, including uppercase text, lighter font weight, and color. |
| `hasCoreStylesNoCaps` | boolean | false   | Applies core label styles but keeps the label text in its original case (not uppercase).                                             |

### General guidelines

- Use clear and accurate labels.
- Use sentence-style capitalization except when referring to an official/branded feature or service name (e.g. Simple Payments).
