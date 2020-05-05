/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Children, PureComponent, cloneElement } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isFunction, times } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import TaskPlaceholder from './task-placeholder';
import { Card } from '@automattic/components';

class Checklist extends PureComponent {
	static propTypes = {
		className: PropTypes.string,
		isPlaceholder: PropTypes.bool,
		onExpandTask: PropTypes.func,
		showChecklistHeader: PropTypes.bool,
		checklistFooter: PropTypes.node,
		updateCompletion: PropTypes.func,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	state = {
		expandedTaskIndex: undefined,
	};

	componentDidMount() {
		this.notifyCompletion();
	}

	UNSAFE_componentWillReceiveProps( { siteId } ) {
		if ( siteId !== this.props.siteId ) {
			this.setState( { expandedTaskIndex: undefined } );
		}
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
			( count, task ) => ( true === task.props.completed ? count + 1 : count) ,
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
			( task ) => task && ! task.props.completed && ! task.props.inProgress
		);
	}

	setExpandedTask = ( newExpandedTaskIndex ) =>
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
				<h2>{ this.props.translate( 'Your setup list' ) }</h2>
			</Card>
		);
	};

	render() {
		const { showChecklistHeader, checklistFooter } = this.props;
		const [ completed, total ] = this.calculateCompletion();

		if ( this.props.isPlaceholder ) {
			return (
				<div className={ classNames( 'checklist', 'is-expanded', 'is-placeholder' ) }>
					{ showChecklistHeader && completed !== total && this.renderChecklistHeader() }

					<div className="checklist__tasks">
						{ times( total, ( index ) => (
							<TaskPlaceholder key={ index } />
						) ) }
					</div>
				</div>
			);
		}

		let skippedChildren = 0;

		return (
			<div className={ classNames( 'checklist', this.props.className ) }>
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

					{ checklistFooter }

					{ completed > 0 && completed < total && (
						<div className="checklist__tasks-completed-title">
							{ this.props.translate( 'Completed' ) }
						</div>
					) }
				</div>
			</div>
		);
	}
}

export default connect( ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} ) )( localize( Checklist ) );
