import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { translate, useRtl } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import { isTaskDisabled, hasIncompleteDependencies } from './task-helper';
import { Task } from './types';

const ChecklistItem = ( { task }: { task: Task } ) => {
	const isRtl = useRtl();
	const { id, isCompleted, keepActive, title, actionDispatch } = task;
	const taskDisabled = isTaskDisabled( task );

	// Display chevron if task is incomplete. Don't display chevron and badge at the same time.
	const shouldDisplayChevron =
		! hasIncompleteDependencies( task ) && ! isCompleted && ! task.badgeText;

	return (
		<li
			className={ classnames( 'launchpad__task', {
				'completed-and-active': isCompleted && keepActive, // a task that is completed and can be revisited
				'completed-and-inactive': isCompleted && ! keepActive, // a task that is completed and can't be revisited
				'not-completed': ! isCompleted && ! keepActive, // a task that hasn't been completed yet
			} ) }
		>
			<Button
				className="launchpad__checklist-item"
				disabled={ taskDisabled }
				data-task={ id }
				onClick={ actionDispatch }
			>
				{ isCompleted && (
					// show checkmark for completed tasks regardless if they are disabled or kept active
					<div className="launchpad__checklist-item-checkmark-container">
						<Gridicon
							aria-label={ translate( 'Task complete' ) }
							className="launchpad__checklist-item-checkmark"
							icon="checkmark"
							size={ 18 }
						/>
					</div>
				) }
				<p className="launchpad__checklist-item-text">{ title }</p>
				{ task.badgeText ? <Badge type="info-blue">{ task.badgeText }</Badge> : null }
				{ shouldDisplayChevron && (
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
