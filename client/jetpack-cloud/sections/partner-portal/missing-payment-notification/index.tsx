import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';

export default function MissingPaymentNotification() {
	const partner = useSelector( getCurrentPartner );
	// eslint-disable-next-line no-console
	console.log( partner );

	return (
		<Notice
			className="is-warning"
			showDismiss={ false }
			text={ translate(
				"The payment for your [month] invoice didn't go through. Please take a moment to complete payment."
			) }
		>
			<a href="/partner-portal/invoices" className="notice__link">
				View Invoice
			</a>
		</Notice>
	);
}
