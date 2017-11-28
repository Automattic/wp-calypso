/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Checklist from '../';

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
			{
				id: 'site-colors',
				title: "Pick your site's colors",
				completedTitle: "You picked your site's colors",
				completedButtonText: 'Change',
				description: 'Add your personal touch to your site by picking your colors.',
				duration: '2 mins',
				url: 'https://wordpress.com/url-to-site-colors',
				completed: false,
			},
			{
				id: 'site-fonts',
				title: "Pick your site's fonts",
				completedTitle: "You picked your site's fonts",
				description: 'Add your personal touch to your site by picking your fonts.',
				duration: '2 mins',
				url: 'https://wordpress.com/url-to-site-fonts',
				completed: false,
			},
			{
				id: 'header-image',
				title: 'Change your header image',
				completedTitle: 'You changed your header image',
				description: 'Personalize your site with a custom image or background color.',
				duration: '2 mins',
				url: 'https://wordpress.com/url-to-header-image',
				completed: false,
			},
		],
	};

	togglePlaceholder = () => {
		this.setState( { showPlaceholder: ! this.state.showPlaceholder } );
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
		const toggleText = this.state.showPlaceholder ? 'Hide Placeholder' : 'Show Placeholder';

		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.togglePlaceholder }>
					{ toggleText }
				</a>
				<div style={ { clear: 'both' } } />
				<Checklist
					tasks={ this.state.tasks }
					onAction={ this.handleAction }
					onToggle={ this.handleToggle }
					isLoading={ this.state.showPlaceholder }
					placeholderCount={ 5 }
				/>
			</div>
		);
	}
}
