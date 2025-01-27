import { plansLink } from '@automattic/calypso-products';
import { PlanTypeSelectorProps } from '@automattic/plans-grid-next';
import { useCallback } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';

interface PathArgs {
	[ key: string ]: string | null;
}

/**
 * Returns a callback to retrieve a plan type destination path or query param depending on
 * the environment ( Ex. ?intervalType=yearly or /plans/yearly/{SITE_SLUG} )
 */
const usePlanTypeDestinationCallback = () => {
	return useCallback(
		( props: Partial< PlanTypeSelectorProps >, additionalArgs: PathArgs = {} ) => {
			const { intervalType = '' } = additionalArgs;
			const defaultArgs = {
				customerType: undefined,
				coupon: props.coupon,
				feature: props.selectedFeature,
				plan: props.selectedPlan,
			};
			// remove empty values from additionalArgs
			const _additionalArgs = Object.keys( additionalArgs ).reduce( ( acc, key ) => {
				return {
					...acc,
					...( additionalArgs[ key ] && { [ key ]: additionalArgs[ key ] } ),
				};
			}, {} );

			if ( props.isInSignup || 'customerType' in additionalArgs || props.isStepperUpgradeFlow ) {
				return addQueryArgs( document.location?.search, {
					...defaultArgs,
					..._additionalArgs,
				} );
			}

			return addQueryArgs(
				plansLink(
					props.basePlansPath || '/plans',
					props.siteSlug,
					intervalType ? String( intervalType ) : '',
					true
				),
				{
					...defaultArgs,
					..._additionalArgs,
					intervalType: undefined,
				}
			);
		},
		[]
	);
};

export default usePlanTypeDestinationCallback;
