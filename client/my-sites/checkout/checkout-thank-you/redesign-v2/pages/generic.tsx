import { isDomainProduct, isPlan } from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import ThankYouLayout from 'calypso/components/thank-you-v2';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getDomainPurchaseType } from '../../utils';
import ProductDomain from '../products/product-domain';
import ProductPlan from '../products/product-plan';
import { getDomainPurchaseDetails } from './domain-only';

interface GenericThankYouContainerProps {
	purchases: ReceiptPurchase[];
}

export const GenericThankYou: React.FC< GenericThankYouContainerProps > = ( { purchases } ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const [ , predicate ] = getDomainPurchaseType( purchases );
	const filteredPurchases = purchases.filter( ( purchase ) => {
		return ! isDomainProduct( purchase ) || predicate( purchase );
	} );

	const products = filteredPurchases.map( ( purchase, index ) => {
		if ( isDomainProduct( purchase ) ) {
			return <ProductDomain purchase={ purchase } siteSlug={ siteSlug } key={ index } />;
		} else if ( isPlan( purchase ) ) {
			return (
				<ProductPlan purchase={ purchase } siteId={ siteId } siteSlug={ siteSlug } key={ index } />
			);
		}

		return <ThankYouProduct key={ index } name={ purchase.productName } />;
	} );

	let purchaseDetailsProps = [];

	filteredPurchases.some( ( purchase ) => {
		if ( isDomainProduct( purchase ) ) {
			purchaseDetailsProps = purchaseDetailsProps.concat( getDomainPurchaseDetails() );
		}

		if ( purchaseDetailsProps.length >= 2 ) {
			return;
		}
	} );

	return (
		<ThankYouLayout
			title={ translate( 'Great Choices!' ) }
			subtitle={ translate( 'All set! Ready to take your site even further?' ) }
			products={ products }
			purchaseDetailsProps={ purchaseDetailsProps.slice( 0, 2 ) }
			masterbarProps={ {
				siteSlug,
				siteId,
				backText: siteSlug ? translate( 'Back to dashboard' ) : undefined,
			} }
		/>
	);
};
