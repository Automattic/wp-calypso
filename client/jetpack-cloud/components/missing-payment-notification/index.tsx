import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Notice from 'calypso/components/notice';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { Invoice } from 'calypso/state/partner-portal/types';

export default function MissingPaymentNotification() {
	const partner = useSelector( getCurrentPartner );

	if ( ! partner || ! partner.keys ) {
		return null;
	}

	// Helper function to check if the date is greater than today
	const isDateLowerThanToday = ( created: string ) => {
		const today = new Date();
		today.setHours( 0, 0, 0, 0 );
		const createdDate = new Date( Number( created ) * 1000 );

		return createdDate < today;
	};

	const getTranslatedMonth = ( date: Date ) => {
		const monthIndex = date.getMonth();

		switch ( monthIndex ) {
			case 0:
				return translate( 'January' );
			case 1:
				return translate( 'February' );
			case 2:
				return translate( 'March' );
			case 3:
				return translate( 'April' );
			case 4:
				return translate( 'May' );
			case 5:
				return translate( 'June' );
			case 6:
				return translate( 'July' );
			case 7:
				return translate( 'August' );
			case 8:
				return translate( 'September' );
			case 9:
				return translate( 'October' );
			case 10:
				return translate( 'November' );
			case 11:
				return translate( 'December' );
			default:
				throw new Error( 'Invalid month' );
		}
	};

	const latestUnpaidInvoice = partner.keys.reduce< Invoice | null >( ( latestInvoice, key ) => {
		if (
			key.latestInvoice &&
			key.latestInvoice.created &&
			isDateLowerThanToday( key.latestInvoice.created ) &&
			key.latestInvoice.status !== 'paid'
		) {
			const createdDate = new Date( Number( key.latestInvoice.created ) * 1000 );
			if ( ! latestInvoice || createdDate > new Date( Number( latestInvoice.created ) * 1000 ) ) {
				return key.latestInvoice;
			}
		}
		return latestInvoice;
	}, null );

	if ( latestUnpaidInvoice ) {
		const warningText = translate(
			"The payment for your %s invoice didn't go through. Please take a moment to complete payment.",
			{
				args: getTranslatedMonth( new Date( Number( latestUnpaidInvoice.created ) * 1000 ) ),
			}
		);

		return (
			<Notice className="is-warning" showDismiss={ false } text={ warningText }>
				<a href="/partner-portal/invoices" className="notice__link">
					View Invoice
				</a>
			</Notice>
		);
	}

	return null;
}
