import ProductPlan, { ProductPlanProps } from './product/ProductPlan';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

const Product = ( {
	siteSlug,
	primaryPurchase,
	siteID,
}: ProductPlanProps & { purchases: ReceiptPurchase[] } ) => {
	return (
		<ProductPlan siteSlug={ siteSlug } primaryPurchase={ primaryPurchase } siteID={ siteID } />
	);
};

export default Product;
