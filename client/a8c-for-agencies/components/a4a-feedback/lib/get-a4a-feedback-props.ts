import { TAB_INVITED_MEMBERS } from 'calypso/a8c-for-agencies/sections/team/constants';
import {
	A4A_TEAM_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
	A4A_REFERRALS_DASHBOARD,
} from '../../sidebar-menu/lib/constants';
import { FeedbackProps, FeedbackType } from '../types';

export const getA4AfeedbackProps = (
	type: FeedbackType,
	translate: ( key: string, args?: Record< string, unknown > ) => string,
	args?: Record< string, unknown >
): FeedbackProps => {
	switch ( type ) {
		case FeedbackType.ReferralCompleted:
			return {
				title: translate( 'Well done! You sent your first referral!' ),
				description: translate(
					'We emailed your referral order to %(email)s. You can assign your products to a site or set up hosting once they pay.',
					{ args: { email: args?.email } }
				) as string,
				redirectUrl: A4A_REFERRALS_DASHBOARD,
				suggestion: {
					label: translate( 'What could have been better during the Referrals process?' ),
					options: [
						{
							label: translate( 'Learning about referrals' ),
							value: 'learning-about-referrals',
						},
						{
							label: translate( 'Finding referral mode' ),
							value: 'finding-referral-mode',
						},
						{
							label: translate( 'Adding products and hosting to the referral cart' ),
							value: 'adding-products-and-hosting-to-the-referral-cart',
						},
						{
							label: translate( 'Sending a referral to my client' ),
							value: 'sending-a-referral-to-my-client',
						},
						{
							label: translate( 'Other' ),
							value: 'other',
						},
					],
				},
			};
		case FeedbackType.PDDetailsAdded:
			return {
				title: translate( 'Details successfully added!' ),
				description: translate(
					"Well done! We've updated your agency's public profile with your information."
				),
				redirectUrl: A4A_PARTNER_DIRECTORY_LINK,
				suggestion: {
					label: translate(
						'What could have been better during the Partner Directory application process?'
					),
					options: [
						{
							label: translate( 'Discovering the partner directories feature' ),
							value: 'discovering-the-partner-directories-feature',
						},
						{
							label: translate( 'Understanding how partner directories can benefit my agency' ),
							value: 'understanding-how-partner-directories-can-benefit-my-agency',
						},
						{
							label: translate(
								'Understanding the criteria my agency needs to meet in order to be included'
							),
							value: 'understanding-the-criteria-my-agency-needs-to-meet-in-order-to-be-included',
						},
						{
							label: translate( 'Other' ),
							value: 'other',
						},
					],
				},
			};
		case FeedbackType.MemberInviteSent:
			return {
				title: translate( 'Invite emailed!' ),
				description: translate(
					"We sent %(email)s an invite. After accepting, they'll become an active member in your Team section.",
					{ args: { email: args?.email } }
				) as string,
				redirectUrl: `${ A4A_TEAM_LINK }/${ TAB_INVITED_MEMBERS }`,
				suggestion: {
					label: translate( 'What could have been better during the team invitation process?' ),
					options: [
						{
							label: translate( 'Finding where to invite my team members' ),
							value: 'finding-where-to-invite-my-team-members',
						},
						{
							label: translate( 'Sending an invitation to a team member' ),
							value: 'sending-an-invitation-to-a-team-member',
						},
						{
							label: translate( 'Finding documentation on team member permissions' ),
							value: 'finding-documentation-on-team-member-permissions',
						},
						{
							label: translate( 'Other' ),
							value: 'other',
						},
					],
				},
			};
		case FeedbackType.PurchaseCompleted:
			return {
				title: translate( 'Purchase complete!' ),
				description: translate(
					"Well done! You've made your first purchase on Automattic for Agencies."
				),
				suggestion: {
					label: translate( 'What could have been better during your purchase process?' ),
					options: [
						{
							label: translate( 'Finding the right products or hosting' ),
							value: 'finding-the-right-products-or-hosting',
						},
						{
							label: translate( 'Understanding the pricing structure' ),
							value: 'understanding-the-pricing-structure',
						},
						{
							label: translate( 'Setting up my product or hosting' ),
							value: 'setting-up-my-product-or-hosting',
						},
						{
							label: translate( 'Other' ),
							value: 'other',
						},
					],
				},
			};
		case FeedbackType.LicenseCancelProduct:
		case FeedbackType.LicenseCancelHosting:
			return {
				title: translate( 'Before you cancel!' ),
				description: translate( "We'd love to hear from you!" ),
				suggestion: {
					label: translate( "Can you tell us why %(productName)s didn't meet your needs?", {
						args: { productName: args?.productName },
					} ),
					options: [
						{
							label: translate( "It had bugs and didn't work for us" ),
							value: 'it-had-bugs-and-didnt-work-for-us',
						},
						{
							label: translate( 'It was the wrong product' ),
							value: 'it-was-the-wrong-product',
						},
						{
							label: translate( 'I was just trying it out' ),
							value: 'i-was-just-trying-it-out',
						},
						{
							label: translate( 'My client no longer needs it' ),
							value: 'my-client-no-longer-needs-it',
						},
						{
							label: translate( 'Other' ),
							value: 'other',
						},
					],
				},
			};
		default:
			return {
				title: translate( 'General feedback' ),
				description: translate( 'Please share general feedback' ),
			};
	}
};
