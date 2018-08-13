Checklist
=======

`Checklist` and `Task` are components used to render checklists.

## `Checklist` props

### `isPlaceholder { bool } - default: false`

Render as a placeholder.

## `Task` props

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

Task title

## Usage

```jsx
<Checklist inferCompletedCount>
	<Task
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
	<Task
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
