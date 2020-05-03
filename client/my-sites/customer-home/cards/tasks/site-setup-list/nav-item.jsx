/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { recordTracksEvent } from 'state/analytics/actions';

const NavItem = ( { text, taskId, isCompleted, isCurrent, onClick, showChevron } ) => {
	const dispatch = useDispatch();

	const trackExpand = () =>
		dispatch(
			recordTracksEvent( 'calypso_checklist_task_expand', {
				step_name: taskId,
				product: 'WordPress.com',
			} )
		);

	return (
		<button
			className={ classnames( 'nav-item', {
				'is-current': isCurrent,
			} ) }
			onClick={ () => {
				trackExpand();
				onClick();
			} }
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
			{ showChevron && <Gridicon className="nav-item__chevron" icon="chevron-right" size={ 18 } /> }
		</button>
	);
};

export default NavItem;
