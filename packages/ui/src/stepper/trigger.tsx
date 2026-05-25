import { Disclosure } from '@ariakit/react/disclosure';
import { Tab } from '@ariakit/react/tab';
import { createElement } from '@wordpress/element';
import clsx from 'clsx';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import { stepPanelId, stepTriggerId } from './types';
import type { StepperTriggerProps } from './types';
import type { ComponentPropsWithRef } from 'react';

export function StepperTrigger( { children, className, ...props }: StepperTriggerProps ) {
	const { orientation, headingLevel, rootId } = useStepperContext();
	const { value, isCurrent, isDisabled } = useStepContext();

	const triggerId = stepTriggerId( rootId, value );
	const panelId = stepPanelId( rootId, value );

	const sharedAttrs = {
		id: triggerId,
		className: clsx( styles.trigger, className ),
		'aria-current': isCurrent ? ( 'step' as const ) : undefined,
	};

	if ( orientation === 'vertical' ) {
		const HeadingTag = `h${ headingLevel }` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

		return createElement(
			HeadingTag,
			{ className: styles[ 'trigger-heading' ] },
			<Disclosure
				{ ...sharedAttrs }
				{ ...props }
				aria-controls={ panelId }
				render={ ( p: ComponentPropsWithRef< 'button' > ) => (
					<button
						{ ...p }
						aria-disabled={ isDisabled ? true : undefined }
						onClick={ isDisabled ? ( e ) => e.preventDefault() : p.onClick }
					/>
				) }
			>
				{ children }
			</Disclosure>
		);
	}

	// Horizontal: Tab from Ariakit handles role="tab", aria-selected, keyboard nav.
	return (
		<Tab
			{ ...sharedAttrs }
			{ ...props }
			id={ triggerId }
			aria-controls={ panelId }
			render={ ( p: ComponentPropsWithRef< 'button' > ) => (
				<button
					{ ...p }
					aria-disabled={ isDisabled ? true : undefined }
					onClick={ isDisabled ? ( e ) => e.preventDefault() : p.onClick }
				/>
			) }
		>
			{ children }
		</Tab>
	);
}

StepperTrigger.displayName = 'Stepper.Trigger';
