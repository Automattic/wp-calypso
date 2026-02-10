import { useTranslate } from 'i18n-calypso';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QuerySites from 'calypso/components/data/query-sites';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import { PlaceholderThankYou } from 'calypso/my-sites/checkout/checkout-thank-you/redesign-v2/pages/placeholder';
import { useSelector } from 'calypso/state';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getDomainPurchaseTypeAndPredicate } from '../../utils';
import ThankYouDomainProduct from '../products/domain-product';
import getDomainFooterDetails from './content/get-domain-footer-details';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

interface DomainOnlyThankYouProps {
	purchases: ReceiptPurchase[];
	isGravatarDomain: boolean;
}

export default function DomainOnlyThankYou( {
	purchases,
	isGravatarDomain,
}: DomainOnlyThankYouProps ) {
	const translate = useTranslate();
	const [ , predicate ] = getDomainPurchaseTypeAndPredicate( purchases );
	const domainPurchases = purchases.filter( predicate );
	const domainNames = domainPurchases.map( ( purchase ) => purchase?.meta );
	const domainSite = useSelector( ( state ) => getSite( state, domainPurchases[ 0 ]?.blogId ) );
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

	const products = domainPurchases.map( ( purchase ) => {
		return (
			<ThankYouDomainProduct
				purchase={ purchase }
				key={ `domain-${ purchase.meta }` }
				siteSlug={ domainSite?.slug }
				isDomainOnly={ domainSite?.options?.is_domain_only ?? true }
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
