import { Icon, check, chevronDown, chevronUp, swatch } from '@wordpress/icons';
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

const AccordionStatusIcon = ( { completed }: { completed: boolean } ) => {
	return (
		<div className="migration-site-ssh__accordion-status-icon">
			{ completed ? (
				<Icon icon={ check } className="migration-site-ssh__accordion-icon-completed" size={ 20 } />
			) : (
				<Icon icon={ swatch } className="migration-site-ssh__accordion-icon-pending" size={ 20 } />
			) }
		</div>
	);
};

export const AccordionStep: FC< AccordionStepProps > = ( { step, index } ) => {
	const onClick = step.onClick ?? function () {};
	return (
		<div
			key={ step.task.id }
			className={ clsx( 'migration-site-ssh__accordion-step', {
				'is-completed': step.task.completed,
				'is-disabled': step.task.disabled,
				'is-open': step.expandable?.isOpen ?? false,
			} ) }
		>
			<button
				className="migration-site-ssh__accordion-header"
				onClick={ onClick }
				disabled={ step.task.disabled }
				aria-expanded={ step.expandable?.isOpen ?? false }
			>
				<div className="migration-site-ssh__accordion-title">
					<AccordionStatusIcon completed={ step.task.completed } />
					<span className="migration-site-ssh__accordion-title-text">
						{ index + 1 }. { step.task.title }
					</span>
				</div>
				<div className="migration-site-ssh__accordion-chevron">
					<Icon icon={ step.expandable?.isOpen ?? false ? chevronUp : chevronDown } size={ 24 } />
				</div>
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
