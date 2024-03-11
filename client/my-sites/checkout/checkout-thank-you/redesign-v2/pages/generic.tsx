import { isDomainProduct, isPlan, isTitanMail } from '@automattic/calypso-products';
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
import getDefaultFooterDetails from './content/get-default-footer-details';
import getDomainFooterDetails from './content/get-domain-footer-details';
import getTitanFooterDetails from './content/get-titan-footer-details';

interface GenericThankYouProps {
	purchases: ReceiptPurchase[];
	emailAddress?: string;
}

export default function GenericThankYou( { purchases, emailAddress }: GenericThankYouProps ) {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const currentRoute = useSelector( getCurrentRoute );
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
				/>
			);
		} else if ( isPlan( purchase ) ) {
			return (
				<ThankYouPlanProduct
					key={ `plan-${ purchase.productSlug }` }
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
					emailAddress={ emailAddress }
					numberOfMailboxesPurchased={ purchase?.newQuantity }
				/>
			);
		}

		return <ThankYouProduct key={ purchase.productSlug } name={ purchase.productName } />;
	} );

	let footerDetails = [];

	filteredPurchases.some( ( purchase ) => {
		if ( isDomainProduct( purchase ) ) {
			footerDetails = footerDetails.concat( getDomainFooterDetails( 'generic', 1 ) );
		} else if ( isTitanMail( purchase ) ) {
			footerDetails = footerDetails.concat(
				getTitanFooterDetails( siteSlug, purchase.meta, currentRoute, 'generic', 1 )
			);
		}

		if ( footerDetails.length >= 2 ) {
			return;
		}
	} );

	if ( footerDetails.length < 2 ) {
		footerDetails = footerDetails.concat( getDefaultFooterDetails( 'generic' ) );
	}

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
