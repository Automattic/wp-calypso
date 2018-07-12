/** @format */
/**
 * External dependencies
 */
import React, { Children, PureComponent } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ChecklistHeader from 'blocks/checklist/checklist-header';

export default class Checklist extends PureComponent {
	state = { hideCompleted: false };

	toggleCompleted = () =>
		this.setState( ( { hideCompleted } ) => ( { hideCompleted: ! hideCompleted } ) );

	render() {
		const { children } = this.props;

		// Doesn't seem to capture connected props :(
		let completed = 0;
		Children.forEach( children, child => {
			if ( child.props.completed ) {
				completed++;
			}
		} );

		return (
			<div
				className={ classNames( 'checklist-v2', 'checklist', {
					'is-expanded': ! this.state.hideCompleted,
					'hide-completed': this.state.hideCompleted,
				} ) }
			>
				<ChecklistHeader
					total={ Children.count( children ) }
					completed={ completed }
					hideCompleted={ this.state.hideCompleted }
					onClick={ this.toggleCompleted }
				/>
				<div className="checklist-v2__items">{ children }</div>
			</div>
		);
	}
}
