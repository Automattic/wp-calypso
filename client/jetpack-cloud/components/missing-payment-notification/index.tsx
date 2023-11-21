import { useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { Invoice } from 'calypso/state/partner-portal/types';

export default function MissingPaymentNotification() {
	const partner = useSelector( getCurrentPartner );
	const locale = useLocale();
	const translate = useTranslate();

	if ( ! partner || ! partner.keys ) {
		return null;
	}

	const latestUnpaidInvoice = partner.keys.reduce< Invoice | null >( ( latestInvoice, key ) => {
		if ( key.latestInvoice && key.latestInvoice.status === 'open' ) {
			return key.latestInvoice;
		}
		return latestInvoice;
	}, null );

	if ( latestUnpaidInvoice ) {
		const warningText = translate(
			"The payment for your %s invoice didn't go through. Please take a moment to complete payment.",
			{
				args: new Date( Number( latestUnpaidInvoice.effectiveAt ) * 1000 ).toLocaleString( locale, {
					month: 'long',
				} ),
			}
		);

		return (
			<Notice className="is-warning" showDismiss={ false } text={ warningText }>
				<a href="/partner-portal/invoices" className="notice__link">
					{ translate( 'View Invoice' ) }
				</a>
			</Notice>
		);
	}

	return null;
}
