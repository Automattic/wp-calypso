import DomainsTransferredList from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/domain-transfer-complete/domains-transferred-list';
import ProductPlan, { ProductPlanProps } from './product/ProductPlan';

const Product = ( {
	siteSlug,
	primaryPurchase,
	purchases,
	isBulkDomainTransfer,
}: ProductPlanProps & { isBulkDomainTransfer: boolean } ) => {
	if ( isBulkDomainTransfer ) {
		return <DomainsTransferredList purchases={ purchases } />;
	}

	return (
		<ProductPlan
			siteSlug={ siteSlug }
			primaryPurchase={ primaryPurchase }
			purchases={ purchases }
		/>
	);
};

export default Product;
