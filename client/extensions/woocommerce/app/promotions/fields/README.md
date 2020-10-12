# Form Fields

Specific FormField components in this directory are created for a data-driven
promotions UI.

## TextField

Displays a simple text field input.

## CurrencyField

Displays a currency input.

## PercentField

Displays a numeric input that constrains the value from 0 to 100.

## Props

All fields utilize the same prop types, as they're designed to be iterated
and populated automatically.

### `labelText` (required)

Translated text to be shown as the label.

### `explanationText` (optional)

Translated text to be shown below the field children.

### `isRequired` (optional)

If true, show a "Required" annotation next to the label.

### `isEnableable` (optional)

If true, show a checkbox next to the label that will enable and disable this field.

### `fieldName` (required)

The name of the promotion field.

### `placeholderText` (optional)

The placeholder text to display within the input before anything is entered.

### `defaultValue` (optional)

The default value to be used upon initialization or when enabled if `isEnableable`.

### `value` (optional)

The current value to be rendered within the field.

### `edit` (required)

A field edit function which takes two arguments: `( fieldName, newValue )`.

### `currency` (optional)

The currency prop is provided by the iterating code for those components which
need to display currency-specific components.

## Base component: FormField

This is the component that is used by all other more specific components.
It's used to create custom components to be referenced by the promotions model.

### `children` (required)

FormField expects to have children, which are used to carry the value of the
field and send change events.
