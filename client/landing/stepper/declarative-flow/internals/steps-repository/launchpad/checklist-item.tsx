import { Button, Gridicon } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { Task } from './types';

const ChecklistItem = ( { task }: { task: Task } ) => {
	const { id, isCompleted, actionUrl, title } = task;
	return (
		<li className={ `launchpad__task-${ id }` }>
			<Button className="launchpad__checklist-item" href={ actionUrl } data-task={ id }>
				<div className="launchpad__checklist-item-status">
					{ task.isCompleted ? (
						<Gridicon
							aria-label={ translate( 'Task complete' ) }
							className="launchpad__checklist-item-status-complete"
							icon="checkmark"
							size={ 18 }
						/>
					) : (
						<div
							role="img"
							aria-label={ translate( 'Task incomplete' ) }
							className="launchpad__checklist-item-status-pending"
						/>
					) }
				</div>
				<p className={ `launchpad__checklist-item-text ${ isCompleted && 'completed' }` }>
					{ title }
				</p>
				<Gridicon className="launchpad__checklist-item-chevron" icon="chevron-right" size={ 18 } />
			</Button>
		</li>
	);
};

export default ChecklistItem;
