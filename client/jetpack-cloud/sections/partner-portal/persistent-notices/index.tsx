import { useLocale } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Notice from 'calypso/components/notice';
import { getCurrentPartner } from 'calypso/state/partner-portal/partner/selectors';
import { Invoice } from 'calypso/state/partner-portal/types';
import { warningPartnerPortalPersistentNotice } from './actions';
import { getJetpackManagePersistentNotices } from './selectors';

const JetpackPersistentNotices = () => {
	const dispatch = useDispatch();
	const storeJetpackManagePersistentNotices = useSelector( getJetpackManagePersistentNotices );
	const partner = useSelector( getCurrentPartner );
	const locale = useLocale();

	useEffect( () => {
		const handleWarningPartnerPortalPersistentNotice = () => {
			if ( ! partner || ! partner.keys ) {
				return null;
			}

			const latestUnpaidInvoice = partner.keys.reduce< Invoice | null >( ( latestInvoice, key ) => {
				if ( key.latestInvoice && key.latestInvoice.status !== 'paid' ) {
					return key.latestInvoice;
				}
				return latestInvoice;
			}, null );

			if ( latestUnpaidInvoice ) {
				const warningText =
					'' +
					translate(
						"The payment for your %s invoice didn't go through. Please take a moment to complete payment.",
						{
							args: new Date( Number( latestUnpaidInvoice.effectiveAt ) * 1000 ).toLocaleString(
								locale,
								{
									month: 'long',
								}
							),
						}
					);

				dispatch(
					warningPartnerPortalPersistentNotice( 'unpaid-invoice-notice', warningText, {
						linkText: translate( 'View Invoice' ),
						linkUrl: '/partner-portal/invoices',
					} )
				);
			}
		};

		handleWarningPartnerPortalPersistentNotice();
	}, [ partner, dispatch, locale ] );

	const noticesList = storeJetpackManagePersistentNotices.map( ( notice ) => (
		<Notice
			{ ...notice }
			key={ `persistent-notice-${ notice.noticeId }` }
			showDismiss={ false }
			text={ notice.text }
		>
			<a href={ notice.linkUrl } className="notice__link">
				{ notice.linkText }
			</a>
		</Notice>
	) );

	if ( ! noticesList.length ) {
		return null;
	}

	return <div>{ noticesList }</div>;
};

export default JetpackPersistentNotices;
