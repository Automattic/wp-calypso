import { translate } from 'i18n-calypso';
import { FeedbackType } from '../types';

type A4AfeedbackProps = {
	title: string;
	description: string;
	questionDetails: string;
};

export const getA4AfeedbackProps = ( type: FeedbackType, args?: any ): A4AfeedbackProps => {
	switch ( type ) {
		case 'referral-complete':
			return {
				title: translate( 'Your referral order is complete!' ),
				description: translate(
					'Your referral order was emailed to %(email)s for payment. Once they pay, you can assign the products to a site.',
					{ args: { email: args?.email } }
				) as string,
				questionDetails: translate( 'How was your experience making a referral?' ),
			};
		case 'agency-details-added':
			return {
				title: translate( 'Agency details added!' ),
				description: translate(
					'Nice job! Your information has been added to the your agency’s public profile.'
				),
				questionDetails: translate( 'How was your experience adding your agency’s details?' ),
			};
		case 'member-invite-sent':
			return {
				title: translate( 'Invite sent!' ),
				description: translate(
					'Your team member invite was emailed to %(email)s. Once they accept, you’ll see them as an active member in the Team section.',
					{ args: { email: args?.email } }
				) as string,
				questionDetails: translate( 'How was your experience inviting a team member?' ),
			};
		default:
			return {
				title: translate( 'General feedback' ),
				description: translate( 'Please share general feedback' ),
				questionDetails: translate( 'How was your experience?' ),
			};
	}
};
