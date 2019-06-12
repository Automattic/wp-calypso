/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Children, PureComponent, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { get, isFunction, times } from 'lodash';

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
		expandedTaskId: null,
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

	getFirstIncompleteTaskId() {
		return get(
			Children.toArray( this.props.children ).find( task => task && ! task.props.completed ),
			[ 'props', 'id' ]
		);
	}

	setExpandedTask = newExpandedTaskId =>
		void this.setState( ( { expandedTaskId } ) => {
			if ( newExpandedTaskId === expandedTaskId ) {
				return { expandedTaskId: null }; // Collapse
			}

			if ( isFunction( this.props.onExpandTask ) ) {
				this.props.onExpandTask( newExpandedTaskId );
			}

			return { expandedTaskId: newExpandedTaskId }; // Expand
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
					{ Children.map( this.props.children, child => {
						if ( ! child ) {
							return child;
						}

						// If the user hasn't expanded any task, expand the
						// first task that hasn't been completed yet.
						const expandedTaskId = this.state.expandedTaskId || this.getFirstIncompleteTaskId();
						const collapsed = child.props.id !== expandedTaskId;
						return cloneElement( child, {
							collapsed,
							onTaskClick: () => this.setExpandedTask( child.props.id ),
						} );
					} ) }
				</div>
			</div>
		);
	}
}
