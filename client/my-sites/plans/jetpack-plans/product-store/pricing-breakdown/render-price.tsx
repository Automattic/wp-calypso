import PlanPrice from 'calypso/my-sites/plan-price';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import getCurrencyCode from '../utils/get-currency-code';

export const RenderPrice = ( { price }: { price: number } ) => {
	const userCurrencyCode = useSelector( getCurrentUserCurrencyCode );
	const currencyCode = getCurrencyCode( undefined, userCurrencyCode );

	return price ? (
		<PlanPrice rawPrice={ price } currencyCode={ currencyCode } displayFlatPrice />
	) : null;
};
