import { Badge, Button, Gridicon } from '@automattic/components';
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
					disabled={ disabled }
					data-task={ id }
					onClick={ handlePrimaryAction }
				>
					{ title }
				</Button>
			) : (
				<Button
					className="checklist-item__task-content"
					disabled={ disabled }
					data-task={ id }
					onClick={ actionDispatch }
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
