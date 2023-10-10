import {
	type PlanSlug,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FREE,
	TYPE_WOO_EXPRESS_PLUS,
	findPlansKeys,
	TERMS_LIST,
	TYPE_HOSTING_TRIAL,
	TYPE_P2_FREE,
	TYPE_P2_PLUS,
} from '@automattic/calypso-products';
import warn from '@wordpress/warning';

interface Props {
	planTypes: string[];
	term: ( typeof TERMS_LIST )[ number ];
}

const usePlansFromTypes = ( { planTypes, term }: Props ): PlanSlug[] => {
	const plans = planTypes.reduce( ( accum: PlanSlug[], type ) => {
		// These plans don't have a term.
		// We may consider to move this logic into the underlying `planMatches` function, but that would have wider implication so it's TBD
		const planQuery = [
			TYPE_FREE,
			TYPE_ENTERPRISE_GRID_WPCOM,
			TYPE_WOO_EXPRESS_PLUS,
			TYPE_HOSTING_TRIAL,
			TYPE_P2_FREE,
			TYPE_P2_PLUS,
		].includes( type )
			? { type }
			: { type, term };
		const plan = findPlansKeys( planQuery )[ 0 ];

		if ( ! plan ) {
			warn(
				`Invalid plan type, \`${ type }\`, provided to \`PlansFeaturesMain\` component. See plans constants for valid plan types.`
			);
		}

		return plan ? [ ...accum, plan as PlanSlug ] : accum;
	}, [] );

	return plans;
};

export default usePlansFromTypes;
