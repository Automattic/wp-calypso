import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { SiteDetails } from 'calypso/../packages/data-stores/src';
import Badge from 'calypso/components/badge';
import { Task } from './types';

interface ChecklistItemProps {
	task: Task;
	site: SiteDetails | null;
}

const ChecklistItem = ( { task, site }: ChecklistItemProps ) => {
	const { id, isCompleted, actionUrl, title } = task;
	const isFreePlan = task.id === 'plan_selected' && site?.plan?.product_slug === 'free_plan';

	return (
		<li className={ `launchpad__task-${ id }` }>
			<Button
				className={ `launchpad__checklist-item ${ isCompleted && 'is-complete' }` }
				disabled={ task.isCompleted && ! isFreePlan }
				href={ actionUrl }
				data-task={ id }
			>
				{ task.isCompleted && (
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
				{ task.displayBadge ? <Badge type="info-blue">{ task.badgeText }</Badge> : null }
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
