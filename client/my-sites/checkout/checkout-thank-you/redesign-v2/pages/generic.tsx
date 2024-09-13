import { isDomainProduct, isPlan, isTitanMail } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getDomainPurchaseTypeAndPredicate } from '../../utils';
import ThankYouDomainProduct from '../products/domain-product';
import ThankYouPlanProduct from '../products/plan-product';
import { ThankYouTitanProduct } from '../products/titan-product';
import getDomainFooterDetails from './content/get-domain-footer-details';
import getTitanFooterDetails from './content/get-titan-footer-details';
import type { ThankYouFooterDetailProps } from 'calypso/components/thank-you-v2/footer';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

interface GenericThankYouProps {
	purchases: ReceiptPurchase[];
	emailAddress?: string;
}

export default function GenericThankYou( { purchases, emailAddress }: GenericThankYouProps ) {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const currentRoute = useSelector( getCurrentRoute );
	const [ , predicate ] = getDomainPurchaseTypeAndPredicate( purchases );

	// When users purchase a domain registration, we'll have two separate purchase items in the list,
	// one for domain registration and one for domain mapping. This filter ensures we exclude the redundant
	// item that should not be listed in the front end. i.e. a purchased domain registration should
	// only be listed once in the congrats page.
	const filteredPurchases = purchases.filter( ( purchase ) => {
		return ! isDomainProduct( purchase ) || predicate( purchase );
	} );

	const products = filteredPurchases.map( ( purchase, index ) => {
		// Check if this is the first product to set isPrimary
		const isPrimary = index === 0;

		if ( isDomainProduct( purchase ) ) {
			return (
				<ThankYouDomainProduct
					key={ `domain-${ purchase.meta }` }
					purchase={ purchase }
					siteSlug={ siteSlug }
					isPrimary={ isPrimary }
				/>
			);
		} else if ( isPlan( purchase ) ) {
			return (
				<ThankYouPlanProduct
					key={ `plan-${ purchase.productSlug }` }
					purchase={ purchase }
					siteSlug={ siteSlug }
					siteId={ siteId }
					isPrimary={ isPrimary }
				/>
			);
		} else if ( isTitanMail( purchase ) ) {
			return (
				<ThankYouTitanProduct
					key={ `email-${ purchase.meta }` }
					domainName={ purchase.meta }
					siteSlug={ siteSlug }
					emailAddress={ emailAddress }
					numberOfMailboxesPurchased={ purchase?.newQuantity }
					isPrimary={ isPrimary }
				/>
			);
		}

		return (
			<ThankYouProduct
				key={ purchase.productSlug }
				name={ purchase.productName }
				actions={
					<Button href={ `/purchases/subscriptions/${ siteSlug }` }>
						{ translate( 'Manage purchase' ) }
					</Button>
				}
			/>
		);
	} );

	let footerDetails: ThankYouFooterDetailProps[] = [];

	// Footer details should contain at most two support blurbs. The first support blurb for
	// each product will be used to populate the footer, with the exception of plan products.
	filteredPurchases.some( ( purchase ) => {
		if ( isDomainProduct( purchase ) ) {
			footerDetails = footerDetails.concat( getDomainFooterDetails( 'generic', 1 ) );
		} else if ( isTitanMail( purchase ) ) {
			footerDetails = footerDetails.concat(
				getTitanFooterDetails( siteSlug as string, purchase.meta, currentRoute, 'generic', 1 )
			);
		}

		if ( footerDetails.length >= 2 ) {
			return;
		}
	} );

	const title =
		filteredPurchases.length > 1 ? translate( 'Great Choices!' ) : translate( 'Great Choice!' );

	return (
		<ThankYouV2
			title={ title }
			subtitle={ translate( 'All set! Ready to take your site even further?' ) }
			products={ products }
			footerDetails={ footerDetails.slice( 0, 2 ) }
		/>
	);
}
