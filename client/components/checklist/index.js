/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Children, PureComponent } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import ChecklistHeader from 'blocks/checklist/checklist-header';

export default class Checklist extends PureComponent {
	static propTyps = {
		completedCount: PropTypes.number,
		inferCompletedCount: PropTypes.bool,
	};

	state = { hideCompleted: false };

	toggleCompleted = () =>
		this.setState( ( { hideCompleted } ) => ( { hideCompleted: ! hideCompleted } ) );

	render() {
		const { children, completedCount, inferCompletedCount } = this.props;

		const count = inferCompletedCount
			? Children.map( children, child => child.props.completed ).reduce(
					( acc, completed ) => ( true === completed ? acc + 1 : acc ),
					0
			  )
			: completedCount;

		return (
			<div
				className={ classNames( 'checklist-v2', 'checklist', {
					'is-expanded': ! this.state.hideCompleted,
					'hide-completed': this.state.hideCompleted,
				} ) }
			>
				<ChecklistHeader
					total={ Children.count( children ) }
					completed={ count }
					hideCompleted={ this.state.hideCompleted }
					onClick={ this.toggleCompleted }
				/>
				<div className="checklist-v2__items">{ children }</div>
			</div>
		);
	}
}
