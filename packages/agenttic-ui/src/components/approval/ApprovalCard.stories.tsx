import { useState } from 'react';
import { ApprovalCard } from './ApprovalCard';
import type { ApprovalCardState } from './ApprovalCard';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
	title: 'Chat/ApprovalCard',
	component: ApprovalCard,
	tags: [ 'autodocs' ],
	args: {
		proposalId: 'example-approval',
		description: 'Uninstall plugin',
		site: 'My site',
		target: 'Example plugin',
		notice: 'Uninstalling this plugin may remove its saved data.',
		allowForChat: false,
		state: 'pending',
		onDecision: () => {},
	},
	decorators: [
		( Story ) => (
			<div className="agenttic" style={ { maxWidth: 420 } }>
				<Story />
			</div>
		),
	],
} satisfies Meta< typeof ApprovalCard >;

export default meta;
type Story = StoryObj< typeof meta >;

export const Pending: Story = {
	render: function InteractiveApproval( args ) {
		const [ state, setState ] = useState< ApprovalCardState >( 'pending' );
		return (
			<ApprovalCard
				{ ...args }
				state={ state }
				onDecision={ ( decision ) => setState( decision === 'decline' ? 'declined' : 'sending' ) }
			/>
		);
	},
};
export const WithChatGrant: Story = { ...Pending, args: { allowForChat: true } };
export const Sending: Story = { args: { state: 'sending' } };
export const Done: Story = { args: { state: 'done' } };
export const Declined: Story = { args: { state: 'declined' } };
export const Failed: Story = { args: { state: 'failed' } };
export const Cancelled: Story = { args: { state: 'cancelled' } };
export const OutcomeUnknown: Story = { args: { state: 'outcome_unknown' } };
