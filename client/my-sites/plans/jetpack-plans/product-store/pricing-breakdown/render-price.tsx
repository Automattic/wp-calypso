import { PlanPrice } from '@automattic/components';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';

export const RenderPrice = ( { price }: { price: number } ) => {
	const currencyCode = useSelector( getCurrentUserCurrencyCode ) || 'USD';

	return price ? (
		<PlanPrice rawPrice={ price } currencyCode={ currencyCode } displayFlatPrice />
	) : null;
};
