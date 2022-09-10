import { Button, Gridicon } from '@automattic/components';
import { translate, useRtl } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import { isTaskDisabled } from './task-helper';
import { Task } from './types';

const ChecklistItem = ( { task }: { task: Task } ) => {
	const isRtl = useRtl();
	const { id, isCompleted, actionUrl, title, actionDispatch } = task;
	const action = actionDispatch ? { onClick: actionDispatch } : { href: actionUrl };
	const taskDisabled = isTaskDisabled( task );

	return (
		<li className={ `launchpad__task-${ id }` }>
			<Button
				className="launchpad__checklist-item"
				disabled={ taskDisabled }
				href={ actionUrl }
				data-task={ id }
				{ ...action }
			>
				{ isCompleted && taskDisabled && (
					<div className="launchpad__checklist-item-status">
						<Gridicon
							aria-label={ translate( 'Task complete' ) }
							className="launchpad__checklist-item-status-complete"
							icon="checkmark"
							size={ 18 }
						/>
					</div>
				) }
				<p className={ `launchpad__checklist-item-text ${ taskDisabled && 'is-complete' }` }>
					{ title }
				</p>
				{ task.displayBadge && task.badgeText ? (
					<Badge type="info-blue">{ task.badgeText }</Badge>
				) : null }
				{ ! taskDisabled && (
					<Gridicon
						aria-label={ translate( 'Task enabled' ) }
						className="launchpad__checklist-item-chevron"
						icon={ `chevron-${ isRtl ? 'left' : 'right' }` }
						size={ 18 }
					/>
				) }
			</Button>
		</li>
	);
};

export default ChecklistItem;
