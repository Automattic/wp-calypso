import { Badge } from '@automattic/components';
import { Button, Icon } from '@wordpress/components';
import { __, isRTL, sprintf } from '@wordpress/i18n';
import { check, chevronLeft, chevronRight } from '@wordpress/icons';
import clsx from 'clsx';
import type { Task, Expandable } from '../types';
import type { FC, Key } from 'react';

import './style.scss';

interface Props {
	key?: Key;
	task: Task;
	isPrimaryAction?: boolean;
	isHighlighted?: boolean;
	expandable?: Expandable;
	onClick?: () => void;
}

const ChecklistItem: FC< Props > = ( {
	task,
	isPrimaryAction,
	isHighlighted,
	expandable,
	onClick,
} ) => {
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

	const getStatusText = () => {
		const taskTitle = typeof title === 'string' ? title : String( title );

		if ( completed ) {
			return sprintf(
				/* translators: %s: Task title */
				__( 'Completed: %s', 'launchpad' ),
				taskTitle
			);
		}
		if ( disabled ) {
			return sprintf(
				/* translators: %s: Task title */
				__( 'Not available yet: %s', 'launchpad' ),
				taskTitle
			);
		}
		if ( isClickable ) {
			if ( isPrimaryAction ) {
				return sprintf(
					/* translators: %s: Task title */
					__( 'Start task: %s', 'launchpad' ),
					taskTitle
				);
			}
			return sprintf(
				/* translators: %s: Task title in lowercase */
				__( 'Select to %s', 'launchpad' ),
				taskTitle.toLowerCase()
			);
		}
		return sprintf(
			/* translators: %s: Task title */
			__( 'To do: %s', 'launchpad' ),
			taskTitle
		);
	};

	return (
		<li
			className={ clsx( 'checklist-item__task', {
				completed: completed,
				pending: ! completed,
				enabled: ! disabled,
				disabled: disabled,
				expanded: expandable && expandable.isOpen,
				highlighted: isHighlighted,
			} ) }
			aria-current={ isHighlighted ? 'step' : undefined }
		>
			{ isPrimaryAction ? (
				<ButtonElement
					variant="primary"
					className={ clsx( 'checklist-item__checklist-primary-button', buttonClassName ) }
					data-task={ id }
					onClick={ onClickHandler }
					{ ...buttonProps }
				>
					<span className="screen-reader-text">{ getStatusText() }</span>
					<span aria-hidden="true">{ title }</span>
				</ButtonElement>
			) : (
				<ButtonElement
					className={ clsx( 'checklist-item__task-content', buttonClassName ) }
					data-task={ id }
					onClick={ onClickHandler }
					{ ...buttonProps }
				>
					{ completed && (
						<div
							className="checklist-item__checkmark-container"
							aria-hidden="true"
							data-testid="checklist-item-checkmark"
						>
							<Icon icon={ check } className="checklist-item__checkmark" size={ 25 } />
						</div>
					) }
					<span className="checklist-item__text">
						<span className="screen-reader-text">{ getStatusText() }</span>
						<span aria-hidden="true">{ title }</span>
					</span>
					{ task.badge_text ? <Badge type="info-blue">{ task.badge_text }</Badge> : null }
					{ shouldDisplayTaskCounter && (
						<span className="checklist-item__counter">
							{ task.repetition_count }/{ task.target_repetitions }
						</span>
					) }
					{ shouldDisplayChevron && (
						<Icon
							aria-hidden="true"
							className="checklist-item__chevron"
							icon={ isRTL() ? chevronLeft : chevronRight }
							size={ 25 }
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
