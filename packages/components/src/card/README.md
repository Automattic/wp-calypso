# Card

Cards are used as containers to group similar information and tasks together to make it easier to scan and read.

> Includes both `Card` and `CompactCard`

## Usage

```jsx
import { Card, CompactCard } from '@automattic/components';

function render() {
	return (
		<div className="your-stuff">
			<Card>
				<span>Your stuff in a Card</span>
			</Card>

			<CompactCard>
				<span>Your stuff in a CompactCard</span>
			</CompactCard>
		</div>
	);
}
```

### Props

| Name            | Type     | Default | Description                                                                                                                                                                                                                                                                      |
| --------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`     | `string` | null    | Adds CSS classes.                                                                                                                                                                                                                                                                |
| `href`          | `string` | null    | URL of the card. Adds a right chevron icon.                                                                                                                                                                                                                                      |
| `tagName`       | `string` | null    | Allows you to control the tag name of the card wrapper (only if `href` is not specified).                                                                                                                                                                                        |
| `displayAsLink` | `bool`   | false   | Used for cards without a `href` that need to display as a link. Primarily intended for use when `tagName` is "button" and when an `onClick` attribute is set. The corresponding button will render with the same visual appearance as a link (including the right chevron icon). |
| `target`        | `string` | null    | If used with `href`, this specifies where the link opens. Changes the icon to `external`.                                                                                                                                                                                        |
| `compact`       | `bool`   | false   | Decreases the size of the card.                                                                                                                                                                                                                                                  |
| `highlight`     | `string` | null    | Displays a colored highlight. If specified (default is no highlight), can be one of `info`, `success`, `error`, or `warning`.                                                                                                                                                    |

### Additional usage information

- **Compact**: Use to save vertical space when displaying many consecutive cards in a list. The `CompactCard` component slightly modifies the `Card` component (and is equivalent to using `<Card compact />`).
- **Highlight**: Use when you need to highlight information that is neither a `Notice` or `Banner`.

### General guidelines

- Avoid using cards within cards. This is an inefficient use of space.
- Don't display more than one primary button or action in a single card.

## Related components

- To expand/collapse a card, use the [FoldableCard](./foldable-card) component.
- To add a text heading to a card, use the [CardHeading](./card-heading) component.
- To add a call to action, use the [ActionCard](./action-card) component.
