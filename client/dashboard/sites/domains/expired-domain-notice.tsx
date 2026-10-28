import { purchaseQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useLocale } from '../../app/locale';
import { Notice } from '../../components/notice';
import { formatDate } from '../../utils/datetime';
import { getRenewalUrlFromPurchase } from '../../utils/purchase';
import type { DomainSummary } from '@automattic/api-core';

export default function ExpiredDomainNotice( { domain }: { domain: DomainSummary } ) {
	const locale = useLocale();
	const { recordTracksEvent } = useAnalytics();
	const [ isDismissed, setIsDismissed ] = useState( false );
	const { data: purchase } = useQuery(
		purchaseQuery( parseInt( domain.subscription_id ?? '0', 10 ) )
	);

	if ( isDismissed ) {
		return null;
	}

	const expiryDate = domain.expiry
		? formatDate( new Date( domain.expiry ), locale, { dateStyle: 'long' } )
		: '';

	return (
		<Notice
			variant="error"
			title={ __( 'Expired domain' ) }
			onClose={ () => setIsDismissed( true ) }
			actions={
				<Button
					__next40pxDefaultSize
					variant="primary"
					disabled={ ! purchase }
					onClick={ () => {
						if ( ! purchase ) {
							return;
						}
						recordTracksEvent( 'calypso_dashboard_site_domains_expired_notice_renew_click', {
							domain: domain.domain,
						} );
						window.location.href = getRenewalUrlFromPurchase( purchase );
					} }
				>
					{ __( 'Renew domain' ) }
				</Button>
			}
		>
			{ createInterpolateElement(
				/* translators: <domainName /> is a domain name, <expiryDate /> is the date it expired, e.g. September 4, 2026. */
				__( '<domainName /> expired on <expiryDate /> and will be released if it is not renewed.' ),
				{
					domainName: <strong>{ domain.domain }</strong>,
					expiryDate: <span>{ expiryDate }</span>,
				}
			) }
		</Notice>
	);
}
