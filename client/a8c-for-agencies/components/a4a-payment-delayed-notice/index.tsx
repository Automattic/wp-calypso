import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

import './style.scss';

const PAYMENT_DELAYED_DISMISS_PREFERENCE = 'a4a-payment-delayed-notice-dismissed';

const A4APaymentDelayedNotice = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const dismissNotice = () => {
		dispatch( savePreference( PAYMENT_DELAYED_DISMISS_PREFERENCE, true ) );
		dispatch( recordTracksEvent( 'calypso_a4a_payment_delayed_notice_dismissed' ) );
	};

	const isDismissed = useSelector( ( state ) =>
		getPreference( state, PAYMENT_DELAYED_DISMISS_PREFERENCE )
	);

	if ( isDismissed ) {
		return null;
	}

	return (
		<LayoutBanner level="warning" onClose={ dismissNotice } className="a4a-payment-delayed-notice">
			<div>
				{ translate(
					'December 1 payouts have been postponed to December 31 due to higher-than-usual volume. We apologize for any inconvenience.'
				) }
			</div>
		</LayoutBanner>
	);
};

export default A4APaymentDelayedNotice;
