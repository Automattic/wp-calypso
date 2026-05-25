import { useState } from '@wordpress/element';
import { VerticalStepper } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	title: 'Automattic UI/VerticalStepper',
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
	render: () => (
		<VerticalStepper defaultValue="shipping" aria-label="Checkout">
			<VerticalStepper.Step value="info" title="Purchase info" status="completed">
				<p>Purchase info panel content</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="shipping" title="Shipping details">
				<p>Shipping details panel content</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="review" title="Review">
				<p>Review panel content</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	),
};

export const WithDescription: Story = {
	render: () => (
		<VerticalStepper defaultValue="shipping" aria-label="Checkout with descriptions">
			<VerticalStepper.Step
				value="info"
				title="Purchase info"
				description="Provide purchase details"
				status="completed"
			>
				<p>Purchase info panel</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step
				value="shipping"
				title="Shipping details"
				description="Provide shipping details"
			>
				<p>Shipping details panel</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step
				value="review"
				title="Review"
				description="Review before submitting"
				optional
			>
				<p>Review panel</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	),
};

export const WithError: Story = {
	render: () => (
		<VerticalStepper defaultValue="shipping" aria-label="Checkout with error">
			<VerticalStepper.Step value="info" title="Purchase info" status="completed">
				<p>Purchase info panel</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="shipping" title="Shipping details" status="error">
				<p>Shipping details panel</p>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="review" title="Review">
				<p>Review panel</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	),
};

function LinearFlowDemo() {
	const [ step, setStep ] = useState( 'info' );
	return (
		<VerticalStepper value={ step } onValueChange={ setStep } linear aria-label="Linear checkout">
			<VerticalStepper.Step value="info" title="Purchase info">
				<div>
					<p>Fill in purchase info.</p>
					<button onClick={ () => setStep( 'shipping' ) }>Next</button>
				</div>
			</VerticalStepper.Step>
			<VerticalStepper.Step
				value="shipping"
				title="Shipping details"
				status={ step === 'review' ? 'completed' : undefined }
			>
				<div>
					<p>Fill in shipping details.</p>
					<button onClick={ () => setStep( 'review' ) }>Next</button>
				</div>
			</VerticalStepper.Step>
			<VerticalStepper.Step value="review" title="Review">
				<p>Review your order.</p>
			</VerticalStepper.Step>
		</VerticalStepper>
	);
}

export const LinearFlow: Story = {
	render: () => <LinearFlowDemo />,
};
