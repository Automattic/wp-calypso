// packages/ui/src/vertical-stepper/stories/index.stories.tsx
import { useState } from '@wordpress/element';
import { VerticalStepper } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	component: VerticalStepper,
	title: 'Automattic UI/VerticalStepper',
};

export default meta;

type Story = StoryObj< typeof meta >;

function DefaultDemo() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<VerticalStepper
			value={ step }
			onValueChange={ setStep }
			aria-label="Checkout"
			style={ { maxWidth: 400 } }
		>
			<VerticalStepper.Step
				value="shipping"
				title="Shipping address"
				status="completed"
				description="123 Main St, Springfield"
			>
				<p>Shipping form.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="payment" title="Payment method">
				<p>Payment form.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="review" title="Review order" optional>
				<p>Review form.</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	);
}

export const Default: Story = { render: DefaultDemo };

function LinearFlowDemo() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<VerticalStepper
			value={ step }
			onValueChange={ setStep }
			linear
			aria-label="Linear checkout"
			style={ { maxWidth: 400 } }
		>
			<VerticalStepper.Step value="shipping" title="Shipping" status="completed">
				<p>Done.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="payment" title="Payment (current)">
				<p>Fill this out.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="review" title="Review (locked)">
				<p>Not reachable yet.</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	);
}

export const LinearFlow: Story = { render: LinearFlowDemo };

function WithErrorDemo() {
	const [ step, setStep ] = useState( 'payment' );
	return (
		<VerticalStepper
			value={ step }
			onValueChange={ setStep }
			aria-label="Checkout with error"
			style={ { maxWidth: 400 } }
		>
			<VerticalStepper.Step
				value="shipping"
				title="Shipping"
				status="error"
				description="Invalid address"
			>
				<p>Fix the address.</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="payment" title="Payment">
				<p>Payment form.</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	);
}

export const WithError: Story = { render: WithErrorDemo };
