/** @format */
/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Children, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ChecklistHeader from 'blocks/checklist/checklist-header';
import getSiteChecklist from 'state/selectors/get-site-checklist';

export class Checklist extends PureComponent {
	static propTypes = {
		checklistStatus: PropTypes.objectOf( PropTypes.shape( { completed: PropTypes.bool } ) ),
		siteId: PropTypes.number.isRequired,
	};

	state = { hideCompleted: false };

	toggleCompleted = () =>
		this.setState( ( { hideCompleted } ) => ( { hideCompleted: ! hideCompleted } ) );

	render() {
		const { children } = this.props;

		// Doesn't seem to capture connected props :(
		let completed = 0;
		Children.forEach( children, child => {
			if (
				child.props.completed ||
				get( this.props, [ 'checklistStatus', child.props.taskId, 'completed' ] )
			) {
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

export default connect( ( state, { siteId } ) => {
	return {
		checklistStatus: get( getSiteChecklist( state, siteId ), [ 'tasks' ], null ),
	};
} )( Checklist );
