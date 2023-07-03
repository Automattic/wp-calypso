import {
	PlanSlug,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FREE,
	findPlansKeys,
} from '@automattic/calypso-products';
import warn from '@wordpress/warning';

interface Props {
	planTypes: string[];
	group: string;
	term: string;
}

const usePlansFromTypes = ( { planTypes, group, term }: Props ): PlanSlug[] => {
	const plans = planTypes.reduce( ( accum: PlanSlug[], type ) => {
		// the Free plan and the Enterprise plan don't have a term.
		// We may consider to move this logic into the underlying `planMatches` function, but that would have wider implication so it's TBD
		const planQuery =
			type === TYPE_FREE || type === TYPE_ENTERPRISE_GRID_WPCOM
				? { group, type }
				: { group, type, term };
		const plan = findPlansKeys( planQuery )[ 0 ] as PlanSlug;

		if ( ! plan ) {
			warn(
				`Invalid plan type, \`${ type }\`, provided to \`PlansFeaturesMain\` component. See plans constants for valid plan types.`
			);
		}

		return plan ? [ ...accum, plan ] : accum;
	}, [] );

	return plans;
};

export default usePlansFromTypes;
