import { DisclosureContent } from '@ariakit/react/disclosure';
import { TabPanel } from '@ariakit/react/tab';
import clsx from 'clsx';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';
import { stepPanelId, stepTriggerId } from './types';
import type { StepperPanelProps } from './types';

// ─── Vertical panel (always inside Stepper.Step) ─────────────────────────────

function VerticalPanel( {
	forceMount,
	children,
	className,
	...props
}: Omit< StepperPanelProps, 'value' > ) {
	const { rootId } = useStepperContext();
	const { value, totalSteps } = useStepContext();

	const triggerId = stepTriggerId( rootId, value );
	const panelId = stepPanelId( rootId, value );
	const useRegion = totalSteps <= 5;

	return (
		<DisclosureContent
			{ ...props }
			id={ panelId }
			role={ useRegion ? 'region' : undefined }
			aria-labelledby={ useRegion ? triggerId : undefined }
			className={ clsx( styles.panel, styles[ 'panel--vertical' ], className ) }
		>
			{ children }
		</DisclosureContent>
	);
}

// ─── Horizontal panel (outside Stepper.Step, must have value prop) ────────────

function HorizontalPanel( {
	value: valueProp,
	forceMount = false,
	children,
	className,
	...props
}: StepperPanelProps ) {
	const { rootId } = useStepperContext();

	if ( ! valueProp ) {
		// eslint-disable-next-line no-console
		console.warn(
			"[Stepper] Stepper.Panel requires a 'value' prop in horizontal mode to associate it with a step."
		);
	}

	const triggerId = valueProp ? stepTriggerId( rootId, valueProp ) : undefined;
	const panelId = valueProp ? stepPanelId( rootId, valueProp ) : undefined;

	return (
		<TabPanel
			{ ...props }
			id={ panelId }
			tabId={ triggerId }
			unmountOnHide={ ! forceMount }
			className={ clsx( styles.panel, styles[ 'panel--horizontal' ], className ) }
		>
			{ children }
		</TabPanel>
	);
}

// ─── Public export ────────────────────────────────────────────────────────────

export function StepperPanel( props: StepperPanelProps ) {
	const { orientation } = useStepperContext();

	if ( orientation === 'vertical' ) {
		return <VerticalPanel { ...props } />;
	}
	return <HorizontalPanel { ...props } />;
}

StepperPanel.displayName = 'Stepper.Panel';
