Checklist
=======

`Checklist` and `Task` are components used to render checklists.

If your checklist tasks use checklist state from Redux, you can use `Task` from `blocks/checklist/tasks` to pull state by the `id` prop.

## `Checklist` props

### `isPlaceholder { bool } - default: false`

Render as a placeholder.

### `inferCompletedCount { bool } - default: false`

If `Task` children will have a provided `complete` prop, the `Checklist` will count the completed
tasks. This will not work when using connected tasks (see `blocks/checklist/task`).

### `completedCount { number }`

If you cannot use `inferCompletedCount` (you're using connected `Task`s), provide the completion
count here.

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
