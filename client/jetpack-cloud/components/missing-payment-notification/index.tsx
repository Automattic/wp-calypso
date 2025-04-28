import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';

export default function MissingPaymentNotification() {
	const partner = useSelector( getCurrentPartner );
	const locale = useLocale();
	const translate = useTranslate();

	if ( ! partner || ! partner.keys ) {
		return null;
	}

	const firstUnpaidInvoice = partner.keys.find(
		( key ) => key.latestInvoice && key.latestInvoice.status === 'open'
	)?.latestInvoice;

	if ( firstUnpaidInvoice ) {
		const warningText = translate(
			"The payment for your %s invoice didn't go through. Please take a moment to complete payment.",
			{
				args: new Date( Number( firstUnpaidInvoice.effectiveAt ) * 1000 ).toLocaleString( locale, {
					month: 'long',
				} ),
			}
		);

		return (
			<Notice className="is-warning" showDismiss={ false } text={ warningText }>
				<a href="/partner-portal/invoices" className="calypso-notice__link">
					{ translate( 'View Invoice' ) }
				</a>
			</Notice>
		);
	}

	return null;
}
