import { recordTracksEvent } from '@automattic/calypso-analytics';
import { domainProductSlugs } from '@automattic/calypso-products';
import { Global, css } from '@emotion/react';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySites from 'calypso/components/data/query-sites';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { preventWidows } from 'calypso/lib/formatting';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import HundredYearThankYou from 'calypso/my-sites/checkout/checkout-thank-you/hundred-year-thank-you';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import { useSelector } from 'calypso/state';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import ThankYouDomainProduct from '../products/domain-product';
import type { ReceiptData, ReceiptPurchase } from 'calypso/state/receipts/types';

interface DomainBulkTransferThankYouProps {
	receipt: ReceiptData;
	purchases: ReceiptPurchase[];
	currency: string;
}

export default function DomainBulkTransferThankYou( {
	purchases,
	receipt,
	currency,
}: DomainBulkTransferThankYouProps ) {
	const { __, _n } = useI18n();
	const blogIds = purchases.map( ( purchase ) => purchase.blogId );
	const isSingleProductPurchase = purchases.length === 1;
	const isHundredYearDomain = isSingleProductPurchase && purchases[ 0 ].isHundredYearDomain;

	const transferSite = useSelector( ( state ) =>
		isHundredYearDomain ? getSite( state, blogIds[ 0 ] ) : null
	);
	const transferredDomain = useSelector( ( state ) =>
		transferSite
			? getDomainsBySiteId( state, blogIds[ 0 ] ).find(
					( domainObject ) => domainObject.domain === purchases[ 0 ].meta
			  )
			: null
	);

	usePresalesChat( 'wpcom' );

	if ( isHundredYearDomain ) {
		return (
			<>
				{ ! transferSite && <QuerySites siteId={ blogIds[ 0 ] } /> }
				{ ! transferredDomain && <QuerySiteDomains siteId={ blogIds[ 0 ] } /> }
				<Global
					styles={ css`
						main.checkout-thank-you {
							&.is-redesign-v2 {
								&.main {
									max-width: unset;
								}
							}
						}

						body.is-section-checkout,
						body.is-section-checkout .layout__content,
						body.is-section-checkout-thank-you,
						body.is-section-checkout-thank-you .layout__content {
							background: linear-gradient( 233deg, #06101c 2.17%, #050c16 41.26%, #02080f 88.44% );
						}
					` }
				/>
				<HundredYearThankYou
					siteSlug={ String( blogIds[ 0 ] ) }
					receiptId={ Number( receipt.receiptId ) }
					productSlug={ domainProductSlugs.TRANSFER_IN }
				/>
			</>
		);
	}

	const handleUserClick = ( destination: string ) => {
		recordTracksEvent( 'calypso_domain_transfer_complete_click', {
			destination,
		} );
	};

	const headerButtons = (
		<>
			<Button
				href="/setup/domain-transfer"
				onClick={ () => handleUserClick( '/setup/domain-transfer' ) }
				className="is-secondary"
			>
				{ __( 'Transfer more domains' ) }
			</Button>

			<Button
				href={ domainManagementRoot() }
				className="manage-all-domains"
				onClick={ () => handleUserClick( domainManagementRoot() ) }
				variant="primary"
			>
				{ _n( 'Manage your domain', 'Manage your domains', purchases?.length ?? 0 ) }
			</Button>
		</>
	);

	const products = purchases.map( ( purchase, index ) => {
		return <ThankYouDomainProduct purchase={ purchase } currency={ currency } key={ index } />;
	} );

	const footerDetails = [
		{
			key: 'footer-transfer-speed-up',
			title: translate( 'Want to speed this up?' ),
			description: translate(
				'Check your inbox for an email from your current domain provider for instructions on how to speed up the transfer process.'
			),
		},
		{
			key: 'footer-transfer-dns-records',
			title: translate( 'Will my email continue to work?' ),
			description: translate(
				"We'll automatically import any MX, TXT, and A records for your domain, so your email will transfer seamlessly."
			),
		},
	];

	return (
		<ThankYouV2
			title={ translate( 'Your domain transfer has started', 'Your domain transfers have started', {
				count: purchases.length,
			} ) }
			subtitle={
				<>
					<div>
						{ preventWidows(
							translate(
								"We've got it from here. Your domain is being transferred with no downtime.",
								"We've got it from here! Your domains are being transferred with no downtime.",
								{ count: purchases.length }
							)
						) }
					</div>
					<div>
						{ preventWidows(
							translate(
								"We'll send an email when your domain is ready to use.",
								"We'll send an email when your domains are ready to use.",
								{ count: purchases.length }
							)
						) }
					</div>
				</>
			}
			headerButtons={ headerButtons }
			products={ products }
			footerDetails={ footerDetails }
		/>
	);
}
