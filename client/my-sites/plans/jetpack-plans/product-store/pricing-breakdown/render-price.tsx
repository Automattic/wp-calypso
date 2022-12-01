import { useSelector } from 'react-redux';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';

export const RenderPrice = ( { price }: { price: number | string } ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) || 'USD';

	return price ? (
		<PlanPrice rawPrice={ price } currencyCode={ currencyCode } displayFlatPrice />
	) : null;
};
