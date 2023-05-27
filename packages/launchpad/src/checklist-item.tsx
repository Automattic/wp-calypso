import { Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { translate, useRtl } from 'i18n-calypso';
// import Badge from 'calypso/components/badge';
import { Task } from './types';

const ChecklistItem = ( { task, isPrimaryAction }: { task: Task; isPrimaryAction?: boolean } ) => {
	const isRtl = useRtl();
	const { id, completed, disabled, title, subtitle, actionDispatch } = task;

	// Display chevron if task is incomplete. Don't display chevron and badge at the same time.
	const shouldDisplayChevron = ! completed && ! disabled && ! task.badge_text;

	const handlePrimaryAction = () => {
		localStorage.removeItem( 'launchpad_siteSlug' );
		actionDispatch && actionDispatch();
	};

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
					onClick={ handlePrimaryAction }
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
					{ /* { task.badge_text ? <Badge type="info-blue">{ task.badge_text }</Badge> : null } */ }
					{ shouldDisplayChevron && (
						<Gridicon
							aria-label={ translate( 'Task enabled' ) }
							className="launchpad__checklist-item-chevron"
							icon={ `chevron-${ isRtl ? 'left' : 'right' }` }
							size={ 18 }
						/>
					) }
					{ subtitle && <p className="launchpad__checklist-item-subtext">{ subtitle }</p> }
				</Button>
			) }
		</li>
	);
};

ChecklistItem.Placeholder = () => {
	return (
		<div className="launchpad__checklist-item is-placeholder">
			<div className="launchpad__checklist-item-content">
				<div></div>
			</div>
		</div>
	);
};

export default ChecklistItem;
