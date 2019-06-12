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
import ChecklistHeader from './header';
import TaskPlaceholder from './task-placeholder';

export default class Checklist extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		phase2: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
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

	setExpandedTask = newExpandedTaskId =>
		void this.setState( ( { expandedTaskId } ) => {
			if ( newExpandedTaskId === expandedTaskId ) {
				return { expandedTaskId: null }; // Collapse
			}

			return { expandedTaskId }; // Expand
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
					{ React.Children.map( this.props.children, child => {
						if ( ! child ) {
							return child;
						}
						const collapsed = child.props.id !== this.state.expandedTaskId;
						return React.cloneElement( child, {
							collapsed,
							onTaskClick: () => this.setExpandedTask( child.props.id ),
						} );
					} ) }
				</div>
			</div>
		);
	}
}
