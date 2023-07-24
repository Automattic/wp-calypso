import { isBulkDomainTransfer } from '../../utils';
import DomainsTransferredList from './product/DomainsTransferredList';
import ProductPlan, { ProductPlanProps } from './product/ProductPlan';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

const Product = ( {
	siteSlug,
	primaryPurchase,
	siteID,
	purchases,
}: ProductPlanProps & { purchases: ReceiptPurchase[] } ) => {
	if ( isBulkDomainTransfer( purchases ) ) {
		return <DomainsTransferredList purchases={ purchases } />;
	}

	return (
		<ProductPlan siteSlug={ siteSlug } primaryPurchase={ primaryPurchase } siteID={ siteID } />
	);
};

export default Product;
