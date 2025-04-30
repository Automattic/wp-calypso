import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getTotalInvoiceValue } from '../lib/pricing';
import type { SelectedLicenseProp } from '../types';

import './style.scss';

interface Props {
	selectedLicenses: SelectedLicenseProp[];
}

export default function TotalCost( { selectedLicenses }: Props ) {
	const translate = useTranslate();

	const userProducts = useSelector( getProductsList );
	const { discountedCost } = getTotalInvoiceValue( userProducts, selectedLicenses );
	const currencyCode = selectedLicenses?.[ 0 ]?.currency ?? 'USD';
	const formattedTotalCost = <strong>{ formatCurrency( discountedCost, currencyCode ) }</strong>;

	const getTotalCostDisplayString = () => {
		return translate( 'Total: {{formattedTotalCost/}}', {
			comment:
				'%(formattedTotalCost)s is a price formatted for display in the user\'s locale. In en-us it would be like "$4.00"',
			components: {
				formattedTotalCost,
			},
		} );
	};

	return <div className="issue-license-v2__total-cost">{ getTotalCostDisplayString() }</div>;
}
