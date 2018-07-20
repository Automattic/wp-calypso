Checklist
=======

`Checklist` and `Item` are components used to render checklists.

If your checklist items use checklist state from Redux, you can use `Item` from `blocks/checklist/item` to pull state by the `id` prop.

## `Checklist` props

### `isPlaceholder { bool } - default: false`

Render as a placeholder.

### `inferCompletedCount { bool } - default: false`

If `Item` children will have a provided `complete` prop, the `Checklist` will count the completed
items. This will not work when using connected items (see `blocks/checklist/item`).

### `completedCount { number }`

If you cannot use `inferCompletedCount` (you're using connected `Item`s), provide the completion
count here.

## `Item` props

### `completed { bool }`

Whether the task is complete.

### `onClick { Function }`

Handle the action button click.

### `onDismiss { func }`

Handle dismissal (or un-dismissal) click.

### `buttonPrimary { bool }`

Display the action button as primary.

### `completedButtonText { node }`

Button text on complete.

### `completedTitle { node }`

Override title when completed (fallback to `title` prop)

### `description { node }`

Description

### `duration { string }`

Duration, like "2 minutes".

Translate as `translate( '%d minutes', '%d minutes', { count: 2, args: [ 2 ] } )`.

### `title { node }`

Item title

## Usage

```jsx
<Checklist inferCompletedCount>
	<Item
		onClick={ handleSplineClick }
		onDismiss={ handleSplineDismiss }
		title="Reticulate splines"
		buttonText="Reticulate!"
		buttonPrimary
		completedTitle="Splines are reticulated 👍"
		description="Make sure that all the splines are reticulated."
		duration="1 minute"
		completed
	/>
	<Item
		onClick={ handleYakClick }
		onDismiss={ handleYakDismiss }
		title="Shave yaks!"
		buttonText="Buzzzz"
		buttonPrimary
		completedTitle="Yaks shaved."
		description="Make sure you shave the yaks so you can get on with your life."
		duration="10,000 minutes"
	/>
</Checklist>
```
