import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { translate, useRtl } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import { Task } from './types';

const ChecklistItem = ( { task, isPrimaryAction }: { task: Task; isPrimaryAction?: boolean } ) => {
	const isRtl = useRtl();
	const { id, completed, disabled, title, actionDispatch } = task;

	// Display chevron if task is incomplete. Don't display chevron and badge at the same time.
	const shouldDisplayChevron = ! completed && ! disabled && ! task.badgeText;

	return (
		<li
			className={ classnames( 'launchpad__task', {
				completed: completed,
				pending: ! completed,
				enabled: ! disabled,
				disabled: disabled,
			} ) }
		>
			{ isPrimaryAction ? (
				<Button
					className="launchpad__checklist-primary-button"
					disabled={ disabled }
					data-task={ id }
					onClick={ actionDispatch }
				>
					{ title }
				</Button>
			) : (
				<Button
					className="launchpad__checklist-item"
					disabled={ disabled }
					data-task={ id }
					onClick={ actionDispatch }
				>
					{ completed && (
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
					<span className="launchpad__checklist-item-text">{ title }</span>
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
			) }
		</li>
	);
};

export default ChecklistItem;
