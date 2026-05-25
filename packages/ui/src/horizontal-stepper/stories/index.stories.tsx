// packages/ui/src/horizontal-stepper/stories/index.stories.tsx
import { useState } from '@wordpress/element';
import { HorizontalStepper } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta< typeof HorizontalStepper > = {
	component: HorizontalStepper,
	title: 'Automattic UI/HorizontalStepper',
};

export default meta;

type Story = StoryObj< typeof meta >;

function DefaultDemo() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<HorizontalStepper value={ step } onValueChange={ setStep } aria-label="Checkout">
			<HorizontalStepper.Step
				value="shipping"
				title="Shipping"
				status="completed"
				description="123 Main St"
			>
				<p>Shipping form.</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="payment" title="Payment">
				<p>Payment form.</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="review" title="Review" optional>
				<p>Review form.</p>
			</HorizontalStepper.Step>
		</HorizontalStepper>
	);
}

export const Default: Story = { render: DefaultDemo };

function LinearFlowDemo() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<HorizontalStepper value={ step } onValueChange={ setStep } linear aria-label="Linear checkout">
			<HorizontalStepper.Step value="shipping" title="Shipping" status="completed">
				<p>Done.</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="payment" title="Payment">
				<p>Fill this out.</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="review" title="Review">
				<p>Not reachable yet.</p>
			</HorizontalStepper.Step>
		</HorizontalStepper>
	);
}

export const LinearFlow: Story = { render: LinearFlowDemo };

function FiveStepsDemo() {
	const steps = [
		{ value: 'a', title: 'Purchase info', status: 'completed' as const },
		{ value: 'b', title: 'Shipping details' },
		{ value: 'c', title: 'Review' },
		{ value: 'd', title: 'Review again' },
		{ value: 'e', title: 'Review once again' },
	];
	const [ step, setStep ] = useState( 'b' );
	return (
		<HorizontalStepper value={ step } onValueChange={ setStep } aria-label="5-step flow">
			{ steps.map( ( s ) => (
				<HorizontalStepper.Step
					key={ s.value }
					value={ s.value }
					title={ s.title }
					status={ s.status }
				>
					<p>Content for { s.title }</p>
				</HorizontalStepper.Step>
			) ) }
		</HorizontalStepper>
	);
}

export const FiveSteps: Story = { render: FiveStepsDemo };
