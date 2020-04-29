/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';

const NavItem = ( { text, isCompleted, isCurrent, onClickAndTrack } ) => {
	return (
		<button
			className={ classnames( 'nav-item', {
				'is-current': isCurrent,
			} ) }
			onClick={ onClickAndTrack }
		>
			<div className="nav-item__status">
				{ isCompleted ? (
					<Gridicon className="nav-item__complete" icon="checkmark" size={ 18 } />
				) : (
					<div className="nav-item__pending" />
				) }
			</div>
			<div className="nav-item__text">
				<h6>{ text }</h6>
			</div>
		</button>
	);
};

export default connect(
	null,
	( dispatch ) => ( {
		trackAction: ( taskId ) =>
			dispatch(
				composeAnalytics(
					recordTracksEvent( 'calypso_checklist_task_expand', {
						step_name: taskId,
						product: 'WordPress.com',
					} ),
					bumpStat( 'calypso_customer_home', 'checklist_task_expand' )
				)
			),
	} ),
	( stateProps, dispatchProps, ownProps ) => ( {
		...ownProps,
		...stateProps,
		onClickAndTrack: () => {
			ownProps.onClick();
			dispatchProps.trackAction( ownProps.taskId );
		},
	} )
)( NavItem );
