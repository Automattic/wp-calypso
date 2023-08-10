import type { GridPlan } from 'calypso/my-sites/plan-features-2023-grid/hooks/npm-ready/data-store/use-grid-plans';

const LARGE_CURRENCY_CHAR_THRESHOLD = 5;

interface Props {
	gridPlans: GridPlan[];
	returnMonthly?: boolean;
}

/**
 * Hook that returns true if the string representation of any price (discounted/undiscounted)
 * of any of the plan slugs exceeds 5 characters.
 * This is primarily used for lowering the font-size of "large" display prices.
 */
export default function useIsLargeCurrency( { gridPlans, returnMonthly = true }: Props ) {
	return gridPlans.some( ( gridPlan ) => {
		const {
			pricing: { originalPrice, discountedPrice },
		} = gridPlan;

		return [
			originalPrice[ returnMonthly ? 'monthly' : 'full' ],
			discountedPrice[ returnMonthly ? 'monthly' : 'full' ],
		].some( ( price ) => price && price.toString().length > LARGE_CURRENCY_CHAR_THRESHOLD );
	} );
}
