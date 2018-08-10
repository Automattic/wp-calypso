/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Children, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import ChecklistHeader from 'components/checklist/header';
import TaskPlaceholder from 'components/checklist/task-placeholder';

export default class Checklist extends PureComponent {
	static propTyps = {
		completedCount: PropTypes.number,
		inferCompletedCount: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
	};

	state = { hideCompleted: false };

	toggleCompleted = () =>
		this.setState( ( { hideCompleted } ) => ( { hideCompleted: ! hideCompleted } ) );

	renderPlaceholder() {
		return (
			<div className={ classNames( 'checklist', 'is-expanded', 'is-placeholder' ) }>
				<ChecklistHeader total={ 0 } completed={ 0 } />
				<div className="checklist__tasks">
					{ times( Children.count( this.props.children ), index => (
						<TaskPlaceholder key={ index } />
					) ) }
				</div>
			</div>
		);
	}

	render() {
		if ( this.props.isPlaceholder ) {
			return this.renderPlaceholder();
		}

		const { children, completedCount, inferCompletedCount } = this.props;

		const count = inferCompletedCount
			? Children.map( children, child => child.props.completed ).reduce(
					( acc, completed ) => ( true === completed ? acc + 1 : acc ),
					0
			  )
			: completedCount;

		return (
			<div
				className={ classNames( 'checklist', {
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
				<div className="checklist__tasks">{ children }</div>
			</div>
		);
	}
}
