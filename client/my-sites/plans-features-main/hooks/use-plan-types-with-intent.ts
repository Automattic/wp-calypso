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
	getPlan,
	isBloggerPlan,
} from '@automattic/calypso-products';

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
	| 'default';

interface Props {
	intent: PlansIntent;
	selectedPlan?: string;
	sitePlanSlug?: string | null;
	hideEnterprisePlan?: boolean;
}

interface PlanTypesWithIntent {
	planTypes: string[];
}

const usePlanTypesWithIntent = ( {
	selectedPlan,
	sitePlanSlug,
	hideEnterprisePlan,
	intent,
}: Props ): PlanTypesWithIntent => {
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

	const defaultPlanTypes = [
		TYPE_FREE,
		...( isBloggerAvailable ? [ TYPE_BLOGGER ] : [] ),
		TYPE_PERSONAL,
		TYPE_PREMIUM,
		TYPE_BUSINESS,
		TYPE_ECOMMERCE,
		...( isEnterpriseAvailable ? [ TYPE_ENTERPRISE_GRID_WPCOM ] : [] ),
	];

	switch ( intent ) {
		case 'plans-woocommerce':
			return {
				planTypes: [ TYPE_WOOEXPRESS_SMALL, TYPE_WOOEXPRESS_MEDIUM ],
			};
		case 'plans-blog-onboarding':
			return {
				planTypes: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ],
			};
		case 'plans-newsletter':
		case 'plans-link-in-bio':
			return {
				planTypes: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM ],
			};
		case 'plans-new-hosted-site':
			return {
				planTypes: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ],
			};
		case 'plans-new-hosted-site-hosting-flow':
			return {
				planTypes: [ TYPE_BUSINESS, TYPE_ECOMMERCE ],
			};
		case 'plans-import':
			return {
				planTypes: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ],
			};
		case 'plans-plugins':
			return {
				planTypes: [
					...( currentSitePlanType ? [ currentSitePlanType ] : [] ),
					TYPE_BUSINESS,
					TYPE_ECOMMERCE,
				],
			};
		// The Jetpack mobile app only wants to display two plans -- personal and premium
		case 'plans-jetpack-app':
			return {
				planTypes: [ TYPE_PERSONAL, TYPE_PREMIUM ],
			};
		default:
			return {
				planTypes: defaultPlanTypes,
			};
	}
};

export default usePlanTypesWithIntent;
