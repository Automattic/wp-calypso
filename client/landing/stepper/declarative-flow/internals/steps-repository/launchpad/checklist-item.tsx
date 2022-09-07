import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import { isTaskDisabled } from './task-helper';
import { Task } from './types';

const ChecklistItem = ( { task }: { task: Task } ) => {
	const { id, isCompleted, keepActive, actionUrl, title, actionDispatch } = task;
	const action = actionDispatch ? { onClick: actionDispatch } : { href: actionUrl };
	const taskDisabled = isTaskDisabled( task );

	return (
		<li
			className={ classnames( 'launchpad__task', {
				'keep-active': keepActive,
				'is-completed': isCompleted,
			} ) }
		>
			<Button
				className="launchpad__checklist-item"
				disabled={ taskDisabled }
				href={ actionUrl }
				data-task={ id }
				{ ...action }
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
				<p className={ `launchpad__checklist-item-text` }>{ title }</p>
				{ task.displayBadge && task.badgeText ? (
					<Badge type="info-blue">{ task.badgeText }</Badge>
				) : null }
				{ ! taskDisabled && (
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
