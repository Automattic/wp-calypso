/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Children, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get, isEmpty, times } from 'lodash';

/**
 * Internal dependencies
 */
import ChecklistHeader from './header';
import TaskPlaceholder from './task-placeholder';

export default class Checklist extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		phase2: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		progressText: PropTypes.string,
		taskList: PropTypes.object,
		updateCompletion: PropTypes.func,
	};

	componentDidMount() {
		this.notifyCompletion();
	}

	componentDidUpdate() {
		this.notifyCompletion();
	}

	notifyCompletion() {
		const { taskList } = this.props;

		if ( isEmpty( get( taskList, 'tasks', [] ) ) ) {
			return;
		}

		if ( 'function' === typeof this.props.updateCompletion ) {
			const [ complete, total ] = this.calculateCompletion();
			this.props.updateCompletion( { complete: complete >= total } );
		}
	}

	calculateCompletion() {
		const { children } = this.props;
		const childrenArray = Children.toArray( children ).filter(
			task => task && task.props && ! task.props.excludeFromCount
		);
		const completedCount = childrenArray.reduce(
			( count, task ) => ( true === task.props.completed ? count + 1 : count ),
			0
		);
		const total = childrenArray.length;
		return [ completedCount, total ];
	}

	state = { hideCompleted: false };

	toggleCompleted = () =>
		this.setState( ( { hideCompleted } ) => ( { hideCompleted: ! hideCompleted } ) );

	render() {
		const [ completed, total ] = this.calculateCompletion();
		if ( this.props.isPlaceholder ) {
			return (
				<div className={ classNames( 'checklist', 'is-expanded', 'is-placeholder' ) }>
					<ChecklistHeader completed={ completed } total={ total } />
					<div className="checklist__tasks">
						{ times( total, index => (
							<TaskPlaceholder key={ index } />
						) ) }
					</div>
				</div>
			);
		}

		return (
			<div
				className={ classNames( 'checklist', this.props.className, {
					'is-expanded': ! this.state.hideCompleted,
					'hide-completed': this.state.hideCompleted,
					'checklist-phase2': this.props.phase2,
				} ) }
			>
				<ChecklistHeader
					completed={ completed }
					hideCompleted={ this.state.hideCompleted }
					onClick={ this.toggleCompleted }
					total={ total }
					progressText={ this.props.progressText }
				/>
				<div className="checklist__tasks">{ this.props.children }</div>
			</div>
		);
	}
}
