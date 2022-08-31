import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import { Task } from './types';

const ChecklistItem = ( { task }: { task: Task } ) => {
	const { id, isCompleted, actionUrl, title } = task;

	const isLinkInBioSiteLaunchSiteTask = task.id === 'link_in_bio_launched';
	return (
		<li className={ `launchpad__task-${ id }` }>
			<Button
				className="launchpad__checklist-item"
				disabled={ task.isCompleted }
				href={ actionUrl }
				data-task={ id }
			>
				{ task.isCompleted && ! isLinkInBioSiteLaunchSiteTask && (
					<div className="launchpad__checklist-item-status">
						<Gridicon
							aria-label={ translate( 'Task complete' ) }
							className="launchpad__checklist-item-status-complete"
							icon="checkmark"
							size={ 18 }
						/>
					</div>
				) }
				<p className={ `launchpad__checklist-item-text ${ isCompleted && 'is-complete' }` }>
					{ title }
				</p>
				{ task.displayBadge && task.badgeText ? (
					<Badge type="info-blue">{ task.badgeText }</Badge>
				) : null }
				{ ! task.isCompleted && (
					<Gridicon
						className="launchpad__checklist-item-chevron"
						icon="chevron-right"
						size={ 18 }
					/>
				) }
			</Button>
		</li>
	);
};

export default ChecklistItem;
