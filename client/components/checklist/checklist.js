/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Children, PureComponent, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { isFunction, times } from 'lodash';

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
		onExpandTask: PropTypes.func,
		progressText: PropTypes.string,
		updateCompletion: PropTypes.func,
	};

	state = {
		hideCompleted: false,
		expandedTaskIndex: undefined,
	};

	componentDidMount() {
		this.notifyCompletion();
	}

	componentDidUpdate() {
		this.notifyCompletion();
	}

	notifyCompletion() {
		if ( 'function' === typeof this.props.updateCompletion ) {
			const [ complete, total ] = this.calculateCompletion();
			this.props.updateCompletion( { complete: complete >= total } );
		}
	}

	calculateCompletion() {
		const { children } = this.props;
		const childrenArray = Children.toArray( children ).filter( Boolean );
		const completedCount = childrenArray.reduce(
			( count, task ) => ( true === task.props.completed ? count + 1 : count ),
			0
		);
		const total = childrenArray.length;
		return [ completedCount, total ];
	}

	getExpandedTaskIndex() {
		if ( this.state.expandedTaskIndex !== undefined ) {
			return this.state.expandedTaskIndex;
		}

		// If the user hasn't expanded any task, return the
		// first task that hasn't been completed yet.
		return Children.toArray( this.props.children ).findIndex(
			task => task && ! task.props.completed && ! task.props.inProgress
		);
	}

	setExpandedTask = newExpandedTaskIndex =>
		void this.setState( ( { expandedTaskIndex } ) => {
			if ( newExpandedTaskIndex === expandedTaskIndex ) {
				return { expandedTaskIndex: null }; // Collapse
			}

			if ( isFunction( this.props.onExpandTask ) ) {
				this.props.onExpandTask(
					Children.toArray( this.props.children )[ newExpandedTaskIndex ].props
				);
			}

			return { expandedTaskIndex: newExpandedTaskIndex }; // Expand
		} );

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

		let skippedChildren = 0;

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
				<div className="checklist__tasks">
					{ Children.map( this.props.children, ( child, index ) => {
						if ( ! child ) {
							skippedChildren += 1;
							return child;
						}

						const realIndex = index - skippedChildren;

						return cloneElement( child, {
							collapsed: realIndex !== this.getExpandedTaskIndex(),
							onTaskClick: () => this.setExpandedTask( realIndex ),
						} );
					} ) }
				</div>
			</div>
		);
	}
}
