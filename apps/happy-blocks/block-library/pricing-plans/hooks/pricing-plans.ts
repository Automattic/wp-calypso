import { calculateMonthlyPriceForPlan, getPlan, Plan } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { useEffect, useState } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest from 'wpcom-proxy-request';
import config from '../config';
import { ApiPricingPlan } from '../types.js';

export interface BlockPlan extends Plan {
	productSlug: string;
	pathSlug: string;
	rawPrice: number;
	price: string;
	upgradeLabel: string;
	productNameShort: string;
	productName: string;
}

const parsePlans = ( data: ApiPricingPlan[] ): BlockPlan[] => {
	return data
		.filter( ( apiPlan ) => config.plans.includes( apiPlan.product_slug ) )
		.map( ( apiPlan ): BlockPlan => {
			const plan: Plan = getPlan( apiPlan.product_slug ) as Plan;
			return {
				...plan,
				productSlug: apiPlan.product_slug,
				pathSlug: apiPlan.path_slug,
				rawPrice: apiPlan.raw_price,
				price:
					formatCurrency(
						calculateMonthlyPriceForPlan( apiPlan.product_slug, apiPlan.raw_price ),
						apiPlan.currency_code,
						{ stripZeros: true }
					) ?? '',
				upgradeLabel: sprintf(
					// translators: %s is the plan name
					__( 'Upgrade to %s', 'happy-blocks' ),
					apiPlan.product_name_short
				),
				productName: apiPlan.product_name,
				productNameShort: apiPlan.product_name_short,
			};
		} );
};

/**
 *  This hook is used to fetch the plans data from the API and return a data structure to use through
 *  the rest of the block's component tree.
 */
const usePricingPlans = () => {
	const [ plans, setPlans ] = useState< BlockPlan[] >( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState< unknown >( null );

	useEffect( () => {
		const fetchPlans = async () => {
			setIsLoading( true );
			setError( null );
			const url = addQueryArgs( '/plans', {
				locale: config.locale,
			} );
			try {
				const data: ApiPricingPlan[] = await wpcomRequest( {
					path: url,
					apiVersion: '1.5',
				} );
				setPlans( parsePlans( data ) );
			} catch ( e: unknown ) {
				setError( e );
			} finally {
				setIsLoading( false );
			}
		};

		fetchPlans();
	}, [] );

	return { data: plans, isLoading, error };
};

export default usePricingPlans;
