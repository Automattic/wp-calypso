import { TAB_INVITED_MEMBERS } from 'calypso/a8c-for-agencies/sections/team/constants';
import { A4A_TEAM_LINK, A4A_PARTNER_DIRECTORY_LINK } from '../../sidebar-menu/lib/constants';
import type { FeedbackProps, FeedbackType } from '../types';

export const getA4AfeedbackProps = (
	type: FeedbackType,
	translate: ( key: string, args?: Record< string, unknown > ) => string,
	args?: Record< string, unknown >
): FeedbackProps => {
	switch ( type ) {
		case 'referral-complete':
			return {
				title: translate( 'Your referral order is complete!' ),
				description: translate(
					'Your referral order was emailed to %(email)s for payment. Once they pay, you can assign the products to a site.',
					{ args: { email: args?.email } }
				) as string,
				questionDetails: translate( 'How was your experience making a referral?' ),
				ctaText: translate( 'Submit and continue to Dashboard' ),
			};
		case 'agency-details-added':
			return {
				title: translate( 'Agency details added!' ),
				description: translate(
					"Nice job! Your information has been added to your agency's public profile."
				),
				questionDetails: translate( "How was your experience adding your agency's details?" ),
				ctaText: translate( 'Submit and continue to Partner Directory' ),
				redirectUrl: A4A_PARTNER_DIRECTORY_LINK,
			};
		case 'member-invite-sent':
			return {
				title: translate( 'Invite sent!' ),
				description: translate(
					"Your team member invite was emailed to %(email)s. Once they accept, you'll see them as an active member in the Team section.",
					{ args: { email: args?.email } }
				) as string,
				questionDetails: translate( 'How was your experience inviting a team member?' ),
				ctaText: translate( 'Submit and continue to Team' ),
				redirectUrl: `${ A4A_TEAM_LINK }/${ TAB_INVITED_MEMBERS }`,
			};
		default:
			return {
				title: translate( 'General feedback' ),
				description: translate( 'Please share general feedback' ),
				questionDetails: translate( 'How was your experience?' ),
				ctaText: translate( 'Submit and continue' ),
			};
	}
};
