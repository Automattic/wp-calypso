import { Badge, Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import classnames from 'classnames';
import { translate, useRtl } from 'i18n-calypso';
import { Task } from '../types';

import './style.scss';

const ChecklistItem = ( { task, isPrimaryAction }: { task: Task; isPrimaryAction?: boolean } ) => {
	const isRtl = useRtl();
	const { id, completed, disabled, title, subtitle, actionDispatch } = task;

	// Display chevron if task is incomplete. Don't display chevron and badge at the same time.
	const shouldDisplayChevron = ! completed && ! disabled && ! task.badge_text;

	const handlePrimaryAction = () => {
		localStorage.removeItem( 'launchpad_siteSlug' );
		actionDispatch && actionDispatch();
	};

	// Display task counter if task is incomplete and has the count properties;
	const shouldDisplayTaskCounter =
		task.target_repetitions &&
		null !== task.repetition_count &&
		undefined !== task.repetition_count;

	// If the task says we should use the Calypso path, ensure we use that link for the button's href.
	// This allows the UI routing code to hook into the URL changes and should reduce full-page (re)loads
	// when clicking on the task list items.
	const buttonHref = task.useCalypsoPath && task.calypso_path ? task.calypso_path : undefined;

	// The Button component does not accept the `disabled` and `href` props together.
	// This code will only add href property if the disabled variable is false.
	const buttonProps = {
		disabled,
		...( disabled ? {} : { href: buttonHref } ),
	};

	return (
		<li
			className={ classnames( 'checklist-item__task', {
				completed: completed,
				pending: ! completed,
				enabled: ! disabled,
				disabled: disabled,
			} ) }
		>
			{ isPrimaryAction ? (
				<Button
					className="checklist-item__checklist-primary-button"
					data-task={ id }
					onClick={ handlePrimaryAction }
					{ ...buttonProps }
				>
					{ title }
				</Button>
			) : (
				<Button
					className="checklist-item__task-content"
					data-task={ id }
					onClick={ actionDispatch }
					{ ...buttonProps }
				>
					{ completed && (
						// show checkmark for completed tasks regardless if they are disabled or kept active
						<div className="checklist-item__checkmark-container">
							<Gridicon
								aria-label={ translate( 'Task complete' ) }
								className="checklist-item__checkmark"
								icon="checkmark"
								size={ 18 }
							/>
						</div>
					) }
					<span className="checklist-item__text">{ title }</span>
					{ task.badge_text ? <Badge type="info-blue">{ task.badge_text }</Badge> : null }
					{ shouldDisplayTaskCounter && (
						<span className="checklist-item__counter">
							{ task.repetition_count }/{ task.target_repetitions }
						</span>
					) }
					{ shouldDisplayChevron && (
						<Gridicon
							aria-label={ translate( 'Task enabled' ) }
							className="checklist-item__chevron"
							icon={ `chevron-${ isRtl ? 'left' : 'right' }` }
							size={ 18 }
						/>
					) }
					{ subtitle && <p className="checklist-item__subtext">{ subtitle }</p> }
				</Button>
			) }
		</li>
	);
};

ChecklistItem.Placeholder = () => {
	return (
		<div className="checklist-item__task-content is-placeholder">
			<div className="checklist-item__content">
				<div></div>
			</div>
		</div>
	);
};

export default ChecklistItem;
