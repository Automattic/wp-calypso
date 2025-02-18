# Button

This button has been deprecated due to aggressive and generic CSS that breaks many other buttons when imported. Use the [`Button` component](https://wordpress.github.io/gutenberg/?path=/docs/components-button--docs) from `@wordpress/components` instead.

---

Buttons express what action will occur when the user clicks or taps it. Buttons are used to trigger an action, and they can be used for any type of action, including navigation.

## Usage

```jsx
import { Button, Gridicon } from '@automattic/components';

export default function RockOnButton() {
	return (
		<Button compact primary>
			You rock!
		</Button>
	);
}
```

### Props

| Name         | Type     | Default | Description                                                                        |
| ------------ | -------- | ------- | ---------------------------------------------------------------------------------- |
| `plain`      | `bool`   | false   | Renders a button with no user-agent styles                                         |
| `compact`    | `bool`   | false   | Decreases the size of the button                                                   |
| `primary`    | `bool`   | false   | Provides extra visual weight and identifies the primary action in a set of buttons |
| `borderless` | `bool`   | false   | Renders a button without borders                                                   |
| `scary`      | `bool`   | false   | Indicates a dangerous or potentially negative action                               |
| `busy`       | `bool`   | false   | Indicates activity while a background action is being performed                    |
| `href`       | `string` | null    | If provided, renders `a` instead of `button`                                       |

### Button types

- **Primary**: Use to highlight the most important actions in any experience. Don’t use more than one primary button in a section or screen to avoid overwhelming customers.
- **Secondary**: Used most in the interface. Only use another style if a button requires more or less visual weight.
- **Button with icon**: When words are not enough, icons can be used in buttons to better communicate what the button does.
- **Scary**: Use when the action will delete customer data or be otherwise difficult to recover from. Destructive buttons should trigger a confirmation dialog before the action is completed. Be thoughtful about using destructive buttons because they can feel stressful for customers.
- **Borderless**: Use for less important or less commonly used actions since they’re less prominent.
- **Busy**: Use when a button has been pressed and the associated action is in progress.
- **Plain**: Use when you need a "button-as-div", to reset all styles from a button that will then be augmented by a consumer. For example, if you need something to _behave_ as a button but not _appear_ as a button, this is a good option.

#### Icon buttons

To use an icon button, insert a Gridicon so that it displays to the left of the text (displaying the `external` icon to the right of the text is the exception). Wrap the text in a `span` or some other element for spacing purposes. You may also create an icon button without text, but use sparingly because it may reduce clarity.

```jsx
import { Button, Gridicon } from '@automattic/components';

export default function RockOnButton() {
	return (
		<Button>
			<Gridicon icon="trash" />
			<span>Button with icon</span>
		</Button>
	);
}
```

### General guidelines

- Use clear and accurate labels.
- Use sentence-style capitalization.
- Lead with strong, concise, and actionable verbs.
- When the customer is confirming an action, use specific labels, such as **Save** or **Trash**, instead of using **OK** and **Cancel**.
- Prioritize the most important actions. Too many calls to action can cause confusion and make customers unsure of what to do next.

## Related components

- To group buttons together, use the [ButtonGroup](./button-group) component.
- To use a button with a secondary popover menu, use the [SplitButton](./split-button) component.
- To display a loading spinner with a button, use the [SpinnerButton](./spinner-button) component.
