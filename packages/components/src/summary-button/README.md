# SummaryButton

The SummaryButton component provides a quick overview of a related page (often settings). It includes a title, supporting description, and may optionally display key field values or status indicators (e.g. a "2FA enabled" badge) to surface the current state of settings at a glance.

## Usage

```jsx
import { SummaryButton } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { backup } from '@wordpress/icons';

function MyComponent() {
	return (
		<SummaryButton
			title="Billing history"
			description="View email receipts for past purchases."
			decoration={ <Icon icon={ backup } /> }
			strapline="Needs attention"
			href="/billing/history"
			badges={ [
				{ text: 'Needs attention', intent: 'warning' },
				{ text: 'Auto-renew off', intent: 'error' },
			] }
		/>
	);
}
```

## Props

| Name        | Type                         | Default | Description                                                                                                                                                           |
| ----------- | ---------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| title       | string                       | -       | The main label that identifies the setting or feature the button links to.                                                                                            |
| href        | string                       | -       | If provided, causes the component to render an `<a />` element instead of a `<button />` element.                                                                     |
| onClick     | React.MouseEventHandler      | -       | A callback to handle clicking an item.                                                                                                                                |
| density     | 'low' \| 'medium'            | 'low'   | Adjusts spacing and layout. Higher density reduces padding and may hide optional elements like the description to create a more compact appearance.                   |
| description | string                       | -       | Optional supporting text that provides additional context or detail about the linked page.                                                                            |
| strapline   | string                       | -       | A brief, optional line of text used to highlight important information, such as a warning or status.                                                                  |
| decoration  | React.ReactElement           | -       | An optional visual element such as an icon or small illustration to enhance visual context or reinforce the category.                                                 |
| badges      | SummaryButtonBadgeProps[]    | -       | This property is used to display `CoreBadge` instances per item. For this reason we need to define the props that match the `CoreBadge` component (intent and text).  |
| showArrow   | boolean                      | true    | A flag that indicates whether to show a chevron at the right-top UI.                                                                                                  |
| disabled    | boolean                      | false   | Determines if the element is disabled. If `true`, this will force a `button` element to be rendered, even when an `href` is given.                                    |
