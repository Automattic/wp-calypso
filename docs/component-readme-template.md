# Component Documentation Template

_Use this as a README.md template when documenting components. If you are creating a new component, you can copy and paste this entire document as a starting point. See the [Button documentation](../design/buttons) for a good example._

Write a short, high-level explanation of the component with a focus on what problem it solves in the interface. Do not include any technical information in this description.
Example:

> Buttons express what action will occur when the user clicks or taps it. Buttons are used to trigger an action, and they can be used for any type of action, including navigation.

## Usage

First, display a `jsx` code block to show an example of usage, including import statements and a React component.

```jsx
import Gridicon from 'calypso/components/gridicons';
import { Button } from '@automattic/components';

export default function RockOnButton() {
	return (
		<Button compact primary>
			You rock!
		</Button>
	);
}
```

### Props

Props are displayed as a table with Name, Type, Default, and Description as headings.

**Required props are marked with `*`.**

| Name         | Type     | Default | Description                                                                        |
| ------------ | -------- | ------- | ---------------------------------------------------------------------------------- |
| `compact`    | `bool`   | `0`     | Decreases the size of the button                                                   |
| `primary`\*  | `bool`   | `0`     | Provides extra visual weight and identifies the primary action in a set of buttons |
| `borderless` | `bool`   | `0`     | Renders a button without borders                                                   |
| `scary`      | `bool`   | `0`     | Indicates a dangerous or potentially negative action                               |
| `busy`\*     | `bool`   | `0`     | Indicates activity while a background action is being performed                    |
| `href`       | `string` | `0`     | If provided, renders `a` instead of `button`                                       |

### Additional usage information

If the component has many states, or if a technical aspect needs more explanation, use this section. Example:

- **Primary**: Use to highlight the most important actions in any experience. Don’t use more than one primary button in a section or screen to avoid overwhelming customers.
- **Secondary**: Used most in the interface. Only use another style if a button requires more or less visual weight.
- **Button with icon**: When words are not enough, icons can be used in buttons to better communicate what the button does.
- **Scary**: Use when the action will delete customer data or be otherwise difficult to recover from. Destructive buttons should trigger a confirmation dialog before the action is completed. Be thoughtful about using destructive buttons because they can feel stressful for customers.
- **Borderless**: Use for less important or less commonly used actions since they’re less prominent.
- **Busy**: Use when a button has been pressed and the associated action is in progress.

### General guidelines

General guidelines should be a list of tips and best practices. Example:

- Use clear and accurate labels. Use sentence-style capitalization.
- Lead with strong, concise, and actionable verbs.
- When the customer is confirming an action, use specific labels, such as **Save** or **Trash**, instead of using **OK** and **Cancel**.
- Prioritize the most important actions. Too many calls to action can cause confusion and make customers unsure of what to do next.

## Related components

This is an unordered list of components that are related in some way. Components are linked to the detail page of that component. Example:

- To group buttons together, use the [ButtonGroup](./button-group) component.
- To use a button with a secondary popover menu, use the [SplitButton](./split-button) component.
- To display a loading spinner with a button, use the [SpinnerButton](../design/spinner-button) component.
