import { Gridicon } from '@automattic/components';
import { Icon, chevronDown, chevronUp, swatch } from '@wordpress/icons';
import clsx from 'clsx';
import React, { FC } from 'react';
import type { Steps as StepsType } from '../steps/use-steps';

interface AccordionProps {
	steps: StepsType;
}

interface AccordionStepProps {
	step: StepsType[ number ];
	index: number;
}

const AccordionStatusIcon: FC< { completed: boolean } > = ( { completed } ) => {
	return (
		<div className="migration-site-ssh__accordion-status-icon">
			{ completed ? (
				<div className="migration-site-ssh__accordion-icon-container-completed">
					<Gridicon
						icon="checkmark"
						className="migration-site-ssh__accordion-icon-completed"
						size={ 12 }
					/>
				</div>
			) : (
				<Icon icon={ swatch } className="migration-site-ssh__accordion-icon-pending" size={ 20 } />
			) }
		</div>
	);
};

export const AccordionStep: FC< AccordionStepProps > = ( { step, index } ) => {
	const isClickable = !! step.onClick;
	const onClick = step.onClick ?? function () {};
	return (
		<div
			key={ step.task.id }
			className={ clsx( 'migration-site-ssh__accordion-step', {
				'is-completed': step.task.completed,
				'is-disabled': step.task.disabled,
				'is-open': step.expandable?.isOpen ?? false,
				'is-clickable': isClickable,
			} ) }
		>
			<button
				className="migration-site-ssh__accordion-header"
				onClick={ onClick }
				disabled={ step.task.disabled || ! isClickable }
				aria-expanded={ step.expandable?.isOpen ?? false }
			>
				<div className="migration-site-ssh__accordion-title">
					<AccordionStatusIcon completed={ step.task.completed } />
					<span className="migration-site-ssh__accordion-title-text">
						{ index + 1 }. { step.task.title }
					</span>
				</div>
				{ isClickable && (
					<div className="migration-site-ssh__accordion-chevron">
						<Icon icon={ step.expandable?.isOpen ?? false ? chevronUp : chevronDown } size={ 24 } />
					</div>
				) }
			</button>
			{ step.expandable?.isOpen && (
				<div className="migration-site-ssh__accordion-content">{ step.expandable?.content }</div>
			) }
		</div>
	);
};

export const Accordion: FC< AccordionProps > = ( { steps } ) => {
	return (
		<div className="migration-site-ssh__accordion">
			{ steps.map( ( step, index ) => (
				<AccordionStep key={ step.task.id } step={ step } index={ index } />
			) ) }
		</div>
	);
};
