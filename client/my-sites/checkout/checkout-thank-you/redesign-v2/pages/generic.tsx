import { isDomainProduct, isPlan, isTitanMail } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getDomainPurchaseTypeAndPredicate } from '../../utils';
import ThankYouDomainProduct from '../products/domain-product';
import ThankYouPlanProduct from '../products/plan-product';
import { ThankYouTitanProduct } from '../products/titan-product';
import getDomainFooterDetails from './content/get-domain-footer-details';

interface GenericThankYouProps {
	purchases: ReceiptPurchase[];
}

export default function GenericThankYou( { purchases }: GenericThankYouProps ) {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const [ , predicate ] = getDomainPurchaseTypeAndPredicate( purchases );
	const filteredPurchases = purchases.filter( ( purchase ) => {
		return ! isDomainProduct( purchase ) || predicate( purchase );
	} );

	const products = filteredPurchases.map( ( purchase ) => {
		if ( isDomainProduct( purchase ) ) {
			return (
				<ThankYouDomainProduct
					key={ `domain-${ purchase.meta }` }
					purchase={ purchase }
					siteSlug={ siteSlug }
					isDomainOnly
				/>
			);
		} else if ( isPlan( purchase ) ) {
			return (
				<ThankYouPlanProduct
					key="plan"
					purchase={ purchase }
					siteSlug={ siteSlug }
					siteId={ siteId }
				/>
			);
		} else if ( isTitanMail( purchase ) ) {
			return (
				<ThankYouTitanProduct
					key={ `email-${ purchase.meta }` }
					domainName={ purchase.meta }
					siteSlug={ siteSlug }
					numberOfMailboxesPurchased={ purchase?.newQuantity }
				/>
			);
		}

		return <ThankYouProduct key={ purchase.productSlug } name={ purchase.productName } />;
	} );

	let footerDetails = [];

	filteredPurchases.some( ( purchase ) => {
		if ( isDomainProduct( purchase ) ) {
			footerDetails = footerDetails.concat( getDomainFooterDetails( 'generic' ) );
		}

		if ( footerDetails.length >= 2 ) {
			return;
		}
	} );

	return (
		<ThankYouV2
			title={ translate( 'Great Choices!' ) }
			subtitle={ translate( 'All set! Ready to take your site even further?' ) }
			products={ products }
			footerDetails={ footerDetails.slice( 0, 2 ) }
		/>
	);
}
