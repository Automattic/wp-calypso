import {
	TYPE_BLOGGER,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	TYPE_WOOEXPRESS_MEDIUM,
	TYPE_WOOEXPRESS_SMALL,
	TYPE_WOO_EXPRESS_PLUS,
	getPlan,
	isBloggerPlan,
	PlanSlug,
	TERMS_LIST,
} from '@automattic/calypso-products';
import HighlightLabel from '../../components/npm-ready/highlight-label';
import usePlansFromTypes from './use-plans-from-types';

// TODO clk: move to plans data store
export type PlansIntent =
	| 'plans-blog-onboarding'
	| 'plans-newsletter'
	| 'plans-link-in-bio'
	| 'plans-new-hosted-site'
	| 'plans-new-hosted-site-hosting-flow'
	| 'plans-plugins'
	| 'plans-jetpack-app'
	| 'plans-import'
	| 'plans-woocommerce'
	| 'plans-default-wpcom'
	| 'default';

// TODO clk: move to types. will consume plan properties
export interface GridPlan {
	planSlug: PlanSlug;
	highlightLabel?: React.ReactNode | null;
}

interface Props {
	intent: PlansIntent;
	term: ( typeof TERMS_LIST )[ number ];
	selectedPlan?: PlanSlug;
	sitePlanSlug?: PlanSlug | null;
	hideEnterprisePlan?: boolean;
	useIsPlanAvailableForUpgradeCheck?: ( { planSlug }: { planSlug: PlanSlug } ) => boolean;
}

// TODO clk: move to plans data store
const useWpcomPlansWithIntent = ( {
	selectedPlan,
	sitePlanSlug,
	hideEnterprisePlan,
	intent,
	term,
	useIsPlanAvailableForUpgradeCheck,
}: Props ): Record< PlanSlug, GridPlan > => {
	const isBloggerAvailable =
		( selectedPlan && isBloggerPlan( selectedPlan ) ) ||
		( sitePlanSlug && isBloggerPlan( sitePlanSlug ) );

	// TODO:
	// this should fall into the processing function for the visible plans
	// however, the Enterprise plan isn't a real plan and lack of some required support
	// from the utility functions right now.
	const isEnterpriseAvailable = ! hideEnterprisePlan;

	let currentSitePlanType = null;
	if ( sitePlanSlug ) {
		currentSitePlanType = getPlan( sitePlanSlug )?.type;
	}

	const availablePlanTypes = [
		TYPE_FREE,
		...( isBloggerAvailable ? [ TYPE_BLOGGER ] : [] ),
		TYPE_PERSONAL,
		TYPE_PREMIUM,
		TYPE_BUSINESS,
		TYPE_ECOMMERCE,
		...( isEnterpriseAvailable ? [ TYPE_ENTERPRISE_GRID_WPCOM ] : [] ),
		TYPE_WOOEXPRESS_SMALL,
		TYPE_WOOEXPRESS_MEDIUM,
		TYPE_WOO_EXPRESS_PLUS,
	];

	let planTypes;
	switch ( intent ) {
		case 'plans-woocommerce':
			planTypes = [ TYPE_WOOEXPRESS_SMALL, TYPE_WOOEXPRESS_MEDIUM, TYPE_WOO_EXPRESS_PLUS ];
			break;
		case 'plans-blog-onboarding':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-newsletter':
		case 'plans-link-in-bio':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM ];
			break;
		case 'plans-new-hosted-site':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-new-hosted-site-hosting-flow':
			planTypes = [ TYPE_BUSINESS, TYPE_ECOMMERCE ];
			break;
		case 'plans-import':
			planTypes = [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
			break;
		case 'plans-plugins':
			planTypes = [
				...( currentSitePlanType ? [ currentSitePlanType ] : [] ),
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
			];
			break;
		case 'plans-jetpack-app':
			planTypes = [ TYPE_PERSONAL, TYPE_PREMIUM ];
			break;
		case 'plans-default-wpcom':
			planTypes = [
				TYPE_FREE,
				...( isBloggerAvailable ? [ TYPE_BLOGGER ] : [] ),
				TYPE_PERSONAL,
				TYPE_PREMIUM,
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
				...( isEnterpriseAvailable ? [ TYPE_ENTERPRISE_GRID_WPCOM ] : [] ),
			];
			break;
		default:
			planTypes = availablePlanTypes;
	}

	const planSlugs = usePlansFromTypes( { planTypes, term } );

	return planSlugs.reduce( ( acc, planSlug ) => {
		return {
			...acc,
			[ planSlug ]: {
				planSlug,
				highlightLabel: HighlightLabel( {
					planSlug,
					currentSitePlanSlug: sitePlanSlug,
					selectedPlan,
					useIsPlanAvailableForUpgradeCheck,
				} ),
			},
		};
	}, {} as Record< PlanSlug, GridPlan > );
};

export default useWpcomPlansWithIntent;
