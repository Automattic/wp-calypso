/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Children, PureComponent, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { isFunction, times } from 'lodash';
import { localize } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import TaskPlaceholder from './task-placeholder';
import Card from 'components/card';
import JetpackChecklistFooter from './jetpack-checklist-footer';

class Checklist extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		phase2: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		onExpandTask: PropTypes.func,
		showChecklistHeader: PropTypes.bool,
		showAdminFooter: PropTypes.bool,
		updateCompletion: PropTypes.func,
		translate: PropTypes.func,
		wpAdminUrl: PropTypes.string,
	};

	state = {
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

	renderChecklistHeader = () => {
		return (
			<Card compact className="checklist__header">
				<h2 className="checklist__header-progress-text">
					{ this.props.translate( 'Your setup list' ) }
				</h2>
			</Card>
		);
	};

	render() {
		const { showChecklistHeader, wpAdminUrl, showAdminFooter } = this.props;
		const [ completed, total ] = this.calculateCompletion();

		if ( this.props.isPlaceholder ) {
			return (
				<div className={ classNames( 'checklist', 'is-expanded', 'is-placeholder' ) }>
					{ showChecklistHeader && completed !== total && this.renderChecklistHeader() }

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
					'checklist-phase2': this.props.phase2,
				} ) }
			>
				{ showChecklistHeader && completed !== total && this.renderChecklistHeader() }

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

					{ wpAdminUrl && showAdminFooter && (
						<JetpackChecklistFooter
							wpAdminUrl={ wpAdminUrl }
							handleWpAdminLink={ this.handleWpAdminLink }
						/>
					) }

					{ completed > 0 && (
						<div className="checklist__tasks-completed-title">
							{ this.props.translate( 'Completed' ) }
						</div>
					) }
				</div>
			</div>
		);
	}
}

export default localize( Checklist );
