import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const NavItem = ( { text, taskId, isCompleted, isCurrent, onClick, useAccordionLayout } ) => {
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
			data-task={ taskId }
		>
			<div className="nav-item__status">
				{ isCompleted ? (
					<Gridicon
						aria-label={ translate( 'Task complete' ) }
						className="nav-item__complete"
						icon="checkmark"
						size={ 18 }
					/>
				) : (
					<div
						role="img"
						aria-label={ translate( 'Task incomplete' ) }
						className="nav-item__pending"
					/>
				) }
			</div>
			<div className="nav-item__text">
				<h6>{ text }</h6>
			</div>
			{ useAccordionLayout && (
				<Gridicon
					className="nav-item__chevron"
					icon={ isCurrent ? 'chevron-up' : 'chevron-down' }
					size={ 18 }
				/>
			) }
		</button>
	);
};

export default NavItem;
