import { domainProductSlugs } from '@automattic/calypso-products';
import { css, Global } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySites from 'calypso/components/data/query-sites';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import HundredYearThankYou from 'calypso/my-sites/checkout/checkout-thank-you/hundred-year-thank-you';
import { PlaceholderThankYou } from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/pages/placeholder';
import { useSelector } from 'calypso/state';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getDomainPurchaseTypeAndPredicate } from '../../utils';
import ThankYouDomainProduct from '../products/domain-product';
import getDomainFooterDetails from './content/get-domain-footer-details';
import type { ReceiptData, ReceiptPurchase } from 'calypso/state/receipts/types';

interface DomainOnlyThankYouProps {
	purchases: ReceiptPurchase[];
	receipt: ReceiptData;
	isGravatarDomain: boolean;
}

export default function DomainOnlyThankYou( {
	purchases,
	receipt,
	isGravatarDomain,
}: DomainOnlyThankYouProps ) {
	const translate = useTranslate();
	const [ , predicate ] = getDomainPurchaseTypeAndPredicate( purchases );
	const domainPurchases = purchases.filter( predicate );
	const domainNames = domainPurchases.map( ( purchase ) => purchase?.meta );
	const domainOnlySite = useSelector( ( state ) => getSite( state, domainPurchases[ 0 ]?.blogId ) );
	const siteDomains = useSelector( ( state ) =>
		getDomainsBySiteId( state, domainPurchases[ 0 ]?.blogId )
	);

	if ( ! siteDomains.length ) {
		return (
			<>
				<QuerySites siteId={ domainPurchases[ 0 ]?.blogId } />
				<QuerySiteDomains siteId={ domainPurchases[ 0 ]?.blogId } />
				<PlaceholderThankYou />
			</>
		);
	}

	if ( domainPurchases.length === 1 ) {
		const purchasedDomain = domainPurchases[ 0 ];
		const domain = siteDomains.find( ( siteDomain ) => siteDomain.name === purchasedDomain.meta );

		if ( domain?.isHundredYearDomain ) {
			return (
				<>
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
								background: linear-gradient(
									233deg,
									#06101c 2.17%,
									#050c16 41.26%,
									#02080f 88.44%
								);
							}
						` }
					/>
					<HundredYearThankYou
						siteSlug={ String( purchasedDomain.blogId ) }
						receiptId={ Number( receipt.receiptId ) }
						productSlug={ domainProductSlugs.DOTCOM_DOMAIN_REGISTRATION }
					/>
				</>
			);
		}
	}

	const products = domainPurchases.map( ( purchase ) => {
		return (
			<ThankYouDomainProduct
				purchase={ purchase }
				key={ `domain-${ purchase.meta }` }
				siteSlug={ domainOnlySite?.slug }
				isDomainOnly
				isGravatarDomain={ isGravatarDomain }
			/>
		);
	} );

	return (
		<>
			<QuerySites siteId={ domainPurchases[ 0 ]?.blogId } />

			<ThankYouV2
				title={ translate( 'Your own corner of the web' ) }
				subtitle={ translate(
					'All set! We’re just setting up your new domain so you can start spreading the word.',
					'All set! We’re just setting up your new domains so you can start spreading the word.',
					{
						count: domainNames.length,
					}
				) }
				products={ products }
				footerDetails={ getDomainFooterDetails( 'domain-only' ) }
				isGravatarDomain={ isGravatarDomain }
			/>
		</>
	);
}
