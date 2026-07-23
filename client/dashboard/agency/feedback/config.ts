import { __, sprintf } from '@wordpress/i18n';
import { FeedbackType, type FeedbackConfig } from './types';

export const FEEDBACK_CONFIG: Record< FeedbackType, FeedbackConfig > = {
	[ FeedbackType.MemberInviteSent ]: {
		title: __( 'Invite emailed!' ),
		getDescription: ( { email } ) =>
			sprintf(
				/* translators: %s: the invited team member's email or username */
				__(
					"We sent %s an invite. After accepting, they'll become an active member in your Team section."
				),
				email ?? ''
			),
		defaultReturnTo: '/team',
		suggestion: {
			label: __( 'What could have been better during the team invitation process?' ),
			options: [
				{
					label: __( 'Finding where to invite my team members' ),
					value: 'finding-where-to-invite-my-team-members',
				},
				{
					label: __( 'Sending an invitation to a team member' ),
					value: 'sending-an-invitation-to-a-team-member',
				},
				{
					label: __( 'Finding documentation on team member permissions' ),
					value: 'finding-documentation-on-team-member-permissions',
				},
				{
					label: __( 'Other' ),
					value: 'other',
				},
			],
		},
	},
};

export function getFeedbackConfig( type: string ): FeedbackConfig | undefined {
	return FEEDBACK_CONFIG[ type as FeedbackType ];
}
