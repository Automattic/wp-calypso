import { __, sprintf } from '@wordpress/i18n';
import type { FeedbackCopy, FeedbackType } from './types';

export interface FeedbackCopyArgs {
	email?: string;
}

export function getFeedbackCopy( type: FeedbackType, args: FeedbackCopyArgs = {} ): FeedbackCopy {
	switch ( type ) {
		case 'team-member-invite-sent':
			return {
				title: __( 'Invite emailed!' ),
				description: sprintf(
					// translators: %(email)s is the email address or username the invite was sent to.
					__(
						"We sent %(email)s an invite. After accepting, they'll become an active member in your Team section."
					),
					{ email: args.email ?? '' }
				),
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
						{ label: __( 'Other' ), value: 'other' },
					],
				},
			};
		case 'partner-directory-details-added':
			return {
				title: __( 'Details successfully added!' ),
				description: __(
					"Well done! We've updated your agency's public profile with your information."
				),
				suggestion: {
					label: __(
						'What could have been better during the Partner Directory application process?'
					),
					options: [
						{
							label: __( 'Discovering the Partner Directories feature' ),
							value: 'discovering-the-partner-directories-feature',
						},
						{
							label: __( 'Understanding how Partner Directories can benefit my agency' ),
							value: 'understanding-how-partner-directories-can-benefit-my-agency',
						},
						{
							label: __(
								'Understanding the criteria my agency needs to meet in order to be included'
							),
							value: 'understanding-the-criteria-my-agency-needs-to-meet-in-order-to-be-included',
						},
						{ label: __( 'Other' ), value: 'other' },
					],
				},
			};
		case 'purchase-completed':
			return {
				title: __( 'Purchase complete!' ),
				description: __( "Well done! You've made your first purchase on Automattic for Agencies." ),
				suggestion: {
					label: __( 'What could have been better during your purchase process?' ),
					options: [
						{
							label: __( 'Finding the right products or hosting' ),
							value: 'finding-the-right-products-or-hosting',
						},
						{
							label: __( 'Understanding the pricing structure' ),
							value: 'understanding-the-pricing-structure',
						},
						{
							label: __( 'Setting up my product or hosting' ),
							value: 'setting-up-my-product-or-hosting',
						},
						{ label: __( 'Other' ), value: 'other' },
					],
				},
			};
	}
}
