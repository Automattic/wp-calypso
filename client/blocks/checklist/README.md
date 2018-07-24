Checklist
===========

Checklist of `ChecklistItem`s.

#### How to use:

```jsx
import Checklist from 'components/checklist';

export default class ChecklistExample extends Component {
	static displayName = 'Checklist';

	state = {
		showPlaceholder: false,
		tasks: [
			{
				id: 'first-completed-task',
				title: 'A completed task',
				completedTitle: 'You completed the first task',
				completedButtonText: 'View',
				description: 'This row shows how completed tasks look.',
				duration: '2 mins',
				url: 'https://wordpress.com/url-to-the-first-task',
				completed: true,
			},
			{
				id: 'second-completed-task',
				title: 'A second completed task',
				completedTitle: 'You completed the second task',
				description: 'This row shows how completed tasks look.',
				duration: '2 mins',
				url: 'https://wordpress.com/url-to-the-second-task',
				completed: true,
			},
			{
				id: 'site-name',
				title: "Add your site's name or logo",
				completedTitle: "You chose your site's name",
				completedButtonText: 'Change',
				description: "A logo or site name helps people know what site they're looking at.",
				duration: '3 mins',
				url: 'https://wordpress.com/url-to-site-name',
				completed: false,
			},
		],
	};

	handleAction = id => {
		const theTask = find( this.state.tasks, { id } );
		console.log( `You will move to ${ theTask.url }.` );
	};

	handleToggle = id => {
		const theTask = find( this.state.tasks, { id } );
		theTask.completed = ! theTask.completed;

		this.setState( { tasks: [ ...this.state.tasks ] } );
	};

	render() {
		return (
			<div>
				<Checklist
					tasks={ this.state.tasks }
					onAction={ this.handleAction }
					onToggle={ this.handleToggle }
					isLoading={ this.state.showPlaceholder }
					placeholderCount={ 3 }
				/>
			</div>
		);
	}
}
```

#### Props

* `tasks`: (array) A set of task objects, passed to `ChecklistItem`s
* `onAction`: (function) Points the user to the given item's action URL. Takes the item's `id`.
* `onToggle`: (function) Changes the state of the given item, toggled on or off. Takes the item's `id`.
* `isLoading`: (boolean) Whether to show the placeholder or not.
* `placeholderCount`: (number) The number of placeholder items to show.
