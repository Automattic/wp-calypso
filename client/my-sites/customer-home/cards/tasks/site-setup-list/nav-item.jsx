import { Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const NavItem = ( {
	text,
	taskId,
	isCompleted,
	isCurrent,
	onClick,
	useAccordionLayout,
	timing,
} ) => {
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
			className={ clsx( 'nav-item', {
				'is-current': isCurrent,
			} ) }
			onClick={ () => {
				trackExpand();
				onClick();
			} }
			role="tab"
			aria-selected={ isCurrent }
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
				<span>{ text }</span>
			</div>
			{ useAccordionLayout && (
				<div className="nav-item__end">
					{ ! isCompleted && (
						<div className="nav-item__task-timing task__timing">
							<Gridicon icon="time" size={ 18 } />
							{ translate( '%d min', '%d mins', {
								count: timing,
								args: [ timing ],
							} ) }
						</div>
					) }
					<Gridicon
						className="nav-item__chevron"
						icon={ isCurrent ? 'chevron-up' : 'chevron-down' }
						size={ 18 }
					/>
				</div>
			) }
		</button>
	);
};

export default NavItem;
