import { plansLink } from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import type { PlanTypeSelectorProps } from '../../types';
interface PathArgs {
	[ key: string ]: string | null;
}

type GeneratePathFunction = ( props: Partial< PlanTypeSelectorProps >, args: PathArgs ) => string;

const generatePath: GeneratePathFunction = ( props, additionalArgs = {} ) => {
	const { intervalType = '' } = additionalArgs;
	const defaultArgs = {
		customerType: undefined,
		discount: props.withDiscount,
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
};

export default generatePath;
