import { useState } from '@wordpress/element';
import { HorizontalStepper } from '..';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
	title: 'Automattic UI/HorizontalStepper',
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
	render: () => (
		<HorizontalStepper defaultValue="shipping" aria-label="Checkout">
			<HorizontalStepper.Step value="info" title="Purchase info" status="completed">
				<p>Purchase info panel content</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="shipping" title="Shipping details">
				<p>Shipping details panel content</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="review" title="Review">
				<p>Review panel content</p>
			</HorizontalStepper.Step>
		</HorizontalStepper>
	),
};

export const WithError: Story = {
	render: () => (
		<HorizontalStepper defaultValue="shipping" aria-label="Checkout with error">
			<HorizontalStepper.Step value="info" title="Purchase info" status="completed">
				<p>Purchase info panel</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="shipping" title="Shipping details" status="error">
				<p>Shipping details panel</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="review" title="Review">
				<p>Review panel</p>
			</HorizontalStepper.Step>
		</HorizontalStepper>
	),
};

export const FiveSteps: Story = {
	render: () => (
		<HorizontalStepper defaultValue="shipping" aria-label="Multi-step checkout">
			<HorizontalStepper.Step value="info" title="Purchase info" status="completed">
				<p>Purchase info</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="shipping" title="Shipping details">
				<p>Shipping details</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="review" title="Review">
				<p>Review</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="review2" title="Review again">
				<p>Review again</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="review3" title="Review once again">
				<p>Review once again</p>
			</HorizontalStepper.Step>
		</HorizontalStepper>
	),
};

function LinearFlowDemo() {
	const [ step, setStep ] = useState( 'info' );
	return (
		<HorizontalStepper value={ step } onValueChange={ setStep } linear aria-label="Linear checkout">
			<HorizontalStepper.Step value="info" title="Purchase info">
				<div>
					<p>Fill in purchase info.</p>
					<button onClick={ () => setStep( 'shipping' ) }>Next</button>
				</div>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step
				value="shipping"
				title="Shipping details"
				status={ step === 'review' ? 'completed' : undefined }
			>
				<div>
					<p>Fill in shipping details.</p>
					<button onClick={ () => setStep( 'review' ) }>Next</button>
				</div>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step value="review" title="Review">
				<p>Review your order.</p>
			</HorizontalStepper.Step>
		</HorizontalStepper>
	);
}

export const LinearFlow: Story = {
	render: () => <LinearFlowDemo />,
};

export const WithDescription: Story = {
	render: () => (
		<HorizontalStepper defaultValue="shipping" aria-label="Checkout with descriptions">
			<HorizontalStepper.Step
				value="info"
				title="Purchase info"
				description="Provide purchase details"
				status="completed"
			>
				<p>Purchase info panel</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step
				value="shipping"
				title="Shipping details"
				description="Provide shipping details"
			>
				<p>Shipping details panel</p>
			</HorizontalStepper.Step>
			<HorizontalStepper.Step
				value="review"
				title="Review"
				description="Review before submitting"
				optional
			>
				<p>Review panel</p>
			</HorizontalStepper.Step>
		</HorizontalStepper>
	),
};
