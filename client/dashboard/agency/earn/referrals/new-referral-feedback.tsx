import { useState } from 'react';
import { earnReferralsRoute } from '../../../app/router/agency';
import { MilestoneFeedbackModal, useMilestoneFeedback } from '../../feedback';

/**
 * Asks about the partner's first referral when the referral checkout returns
 * here with the referral it just created. Partners who already answered or
 * skipped it, here or in the previous dashboard, are not asked again.
 */
export default function NewReferralFeedback() {
	const { new_referral_order_email: email, flow_type: referralFlow } =
		earnReferralsRoute.useSearch();
	const { shouldAsk } = useMilestoneFeedback( 'referral-completed' );
	// The answer is saved in the background; until it lands, `shouldAsk` still says yes.
	const [ isClosed, setIsClosed ] = useState( false );

	if ( ! email || ! shouldAsk || isClosed ) {
		return null;
	}

	return (
		<MilestoneFeedbackModal
			type="referral-completed"
			args={ { email, referralFlow } }
			onClose={ () => setIsClosed( true ) }
		/>
	);
}
