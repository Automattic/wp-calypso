import DomainsTransferredList from './product/DomainsTransferredList';
import ProductPlan, { ProductPlanProps } from './product/ProductPlan';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

const Product = ( {
	siteSlug,
	primaryPurchase,
	siteID,
	purchases,
	isBulkDomainTransfer,
}: ProductPlanProps & { purchases: ReceiptPurchase[]; isBulkDomainTransfer: boolean } ) => {
	if ( isBulkDomainTransfer ) {
		return <DomainsTransferredList purchases={ purchases } />;
	}

	return (
		<ProductPlan siteSlug={ siteSlug } primaryPurchase={ primaryPurchase } siteID={ siteID } />
	);
};

export default Product;
