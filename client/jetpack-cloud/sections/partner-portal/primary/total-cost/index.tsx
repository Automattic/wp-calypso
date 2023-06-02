import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getTotalSelectedCost } from 'calypso/state/partner-portal/products/selectors';
import { PartnerPortalStore } from 'calypso/state/partner-portal/types';

import './styles.scss';

const TotalCost = () => {
	const translate = useTranslate();

	const { data: allProducts } = useProductsQuery();

	const totalCost = useSelector< PartnerPortalStore, number >( ( state ) =>
		getTotalSelectedCost( state, allProducts ?? [] )
	);
	const currencyCode = allProducts && allProducts.length ? allProducts[ 0 ].currency : 'USD';
	const formattedTotalCost = <strong>{ formatCurrency( totalCost, currencyCode ) }</strong>;

	const getTotalCostDisplayString = () => {
		return translate( 'Total: {{formattedTotalCost/}}', {
			args: {
				formattedTotalCost,
			},
			comment: `%(formattedTotalCost)s is a price formatted for display in the user's locale. In en-us it would be like "$4.00"`,
			components: {
				formattedTotalCost,
			},
		} );
	};

	return <div className="total-cost">{ getTotalCostDisplayString() } </div>;
};

export default TotalCost;
