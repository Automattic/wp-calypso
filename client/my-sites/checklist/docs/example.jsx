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
	state = {
		showPlaceholder: false,
		tasks: [
			{
				title: 'A completed task',
				completedTitle: 'You completed the first task',
				description: 'This row shows how completed tasks look.',
				duration: '2 mins',
				completed: true,
			},
			{
				title: 'A second completed task',
				completedTitle: 'You completed the second task',
				description: 'This row shows how completed tasks look.',
				duration: '2 mins',
				completed: true,
			},
			{
				title: "Add your site's name or logo",
				completedTitle: "You chose your site's name",
				description: "A logo or site name helps people know what site they're looking at.",
				duration: '3 mins',
				completed: false,
			},
			{
				title: "Pick your site's colors",
				completedTitle: "You picked your site's colors",
				description: 'Add your personal touch to your site by picking your colors.',
				duration: '2 mins',
				completed: false,
			},
			{
				title: "Pick your site's fonts",
				completedTitle: "You picked your site's fonts",
				description: 'Add your personal touch to your site by picking your fonts.',
				duration: '2 mins',
				completed: false,
			},
			{
				title: 'Change your header image',
				completedTitle: 'You changed your header image',
				description: 'Personalize your site with a custom image or background color.',
				duration: '2 mins',
				completed: false,
			},
		],
	};

	togglePlaceholder = () => {
		this.setState( { showPlaceholder: ! this.state.showPlaceholder } );
	};

	handleClickTask = ( { title } ) => {
		const theTask = find( this.state.tasks, { title } );
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
					onClickTask={ this.handleClickTask }
					isLoading={ this.state.showPlaceholder }
				/>
			</div>
		);
	}
}
