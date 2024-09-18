import { Badge, Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { translate, useRtl } from 'i18n-calypso';
import type { Task, Expandable } from '../types';
import type { FC, Key } from 'react';

import './style.scss';

interface Props {
	key?: Key;
	task: Task;
	isPrimaryAction?: boolean;
	expandable?: Expandable;
	onClick?: () => void;
}

const ChecklistItem: FC< Props > = ( { task, isPrimaryAction, expandable, onClick } ) => {
	const isRtl = useRtl();
	const { id, completed, disabled = false, title, subtitle, actionDispatch } = task;

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

	const onClickHandler = onClick || actionDispatch;
	const isClickable = !! ( buttonProps.href || onClickHandler );

	// Display chevron if task is incomplete.
	// Don't display chevron and badge at the same time.
	// Don't display chevron if item is not clickable.
	const shouldDisplayChevron = ! completed && ! disabled && ! task.badge_text && isClickable;

	// Display task counter if task is incomplete and has the count properties;
	const shouldDisplayTaskCounter =
		task.target_repetitions &&
		null !== task.repetition_count &&
		undefined !== task.repetition_count;

	// Make sure the button keeps the button styles if it is not clickable.
	const buttonClassName = isClickable ? '' : 'components-button';
	const ButtonElement = isClickable ? Button : 'div';

	return (
		<li
			className={ clsx( 'checklist-item__task', {
				completed: completed,
				pending: ! completed,
				enabled: ! disabled,
				disabled: disabled,
				expanded: expandable && expandable.isOpen,
			} ) }
		>
			{ isPrimaryAction ? (
				<ButtonElement
					className={ clsx( 'checklist-item__checklist-primary-button', buttonClassName ) }
					data-task={ id }
					onClick={ onClickHandler }
					{ ...buttonProps }
				>
					{ title }
				</ButtonElement>
			) : (
				<ButtonElement
					className={ clsx( 'checklist-item__task-content', buttonClassName ) }
					data-task={ id }
					onClick={ onClickHandler }
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
				</ButtonElement>
			) }
			{ expandable && expandable.isOpen && (
				<div className="checklist-item__expanded-content">{ expandable.content }</div>
			) }
		</li>
	);
};

export const Placeholder: FC = () => {
	return (
		<div className="checklist-item__task-content is-placeholder">
			<div className="checklist-item__content">
				<div></div>
			</div>
		</div>
	);
};

export default ChecklistItem;
