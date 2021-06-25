# Checklist

`Checklist` and `Task` are components used to render checklists.

## `Checklist` props

### `className { string }`

Additional class to add to the Checklist.

### `isPlaceholder { bool } - default: false`

Render as a placeholder.

### `onExpandTask { func }`

Function that is called when a task is expanded. The task's props are passed as argument.

## `Task` props

### `completed { bool }`

Whether the task is complete.

### `inProgress { bool }`

Whether the task is in progress.

### `onClick { Function }`

Handle the action button click.

### `onDismiss { func }`

Handle dismissal (or un-dismissal) click. Ignored for completed tasks.

### `buttonText { node } - default: "Do it!"`

Text to display in action button.

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

A Checklist expects its children to be a flat list of Task:

```jsx
<Checklist>
	<Task
		onClick={ handleSplineClick }
		onDismiss={ handleSplineDismiss }
		title="Reticulate splines"
		buttonText="Reticulate!"
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
		completedTitle="Yaks shaved."
		description="Make sure you shave the yaks so you can get on with your life."
		duration="10,000 minutes"
	/>
	<Task title="Overwaxing banisters!" inProgress={ ! this.state.overwaxBanisters } />
</Checklist>;
```
