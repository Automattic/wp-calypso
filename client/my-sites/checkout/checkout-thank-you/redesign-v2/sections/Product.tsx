import ProductPlan, { ProductPlanProps } from './product/ProductPlan';

const Product = ( { siteSlug, primaryPurchase, siteID }: ProductPlanProps ) => {
	return (
		<ProductPlan siteSlug={ siteSlug } primaryPurchase={ primaryPurchase } siteID={ siteID } />
	);
};

export default Product;
