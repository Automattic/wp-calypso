import { __, sprintf } from '@wordpress/i18n';
import type { FeedbackCopy, FeedbackType } from './types';

export interface FeedbackCopyArgs {
	email?: string;
	/** For a referral: whether the client was emailed or the agency only copied the link. */
	referralFlow?: 'send' | 'copy';
}

export function getFeedbackCopy( type: FeedbackType, args: FeedbackCopyArgs = {} ): FeedbackCopy {
	switch ( type ) {
		case 'referral-completed':
			return {
				title:
					args.referralFlow === 'copy'
						? __( 'Well done! You created your first referral!' )
						: __( 'Well done! You sent your first referral!' ),
				description:
					args.referralFlow === 'copy'
						? sprintf(
								// translators: %(email)s is the email address of the client the referral is for.
								__(
									'Your referral order for %(email)s is ready. Share its link with them, and you can assign your products to a site or set up hosting once they pay.'
								),
								{ email: args.email ?? '' }
							)
						: sprintf(
								// translators: %(email)s is the email address of the client the referral was sent to.
								__(
									'We emailed your referral order to %(email)s. You can assign your products to a site or set up hosting once they pay.'
								),
								{ email: args.email ?? '' }
							),
				suggestion: {
					label: __( 'What could have been better during the Referrals process?' ),
					options: [
						{ label: __( 'Learning about referrals' ), value: 'learning-about-referrals' },
						{ label: __( 'Finding referral mode' ), value: 'finding-referral-mode' },
						{
							label: __( 'Adding products and hosting to the referral cart' ),
							value: 'adding-products-and-hosting-to-the-referral-cart',
						},
						{
							label: __( 'Sending a referral to my client' ),
							value: 'sending-a-referral-to-my-client',
						},
						{ label: __( 'Other' ), value: 'other' },
					],
				},
			};
		case 'team-member-invite-sent':
			return {
				title: __( 'Invite emailed!' ),
				description: sprintf(
					// translators: %(email)s is the email address or username the invite was sent to.
					__(
						'We sent %(email)s an invite. After accepting, they’ll become an active member in your Team section.'
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
					'Well done! We’ve updated your agency’s public profile with your information.'
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
				description: __( 'Well done! You’ve made your first purchase on Automattic for Agencies.' ),
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
