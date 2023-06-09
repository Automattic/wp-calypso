import {
	TYPE_BLOGGER,
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
	getPlan,
	isBloggerPlan,
} from '@automattic/calypso-products';

export type Intent =
	| 'blog-onboarding'
	| 'newsletter'
	| 'link-in-bio'
	| 'new-hosted-site'
	| 'new-hosted-site-hosting-flow'
	| 'plugins'
	| 'jetpack-app' // newly added
	| 'plans-import'
	| 'plans-ecommerce'
	| 'default';

interface Props {
	intent: Intent;
	selectedPlan: string;
	sitePlanSlug: string;
	hideEnterprisePlan: boolean;
	currentSitePlanSlug?: string;
}

interface PlanTypesWithIntent {
	intent: Intent;
	planTypes: string[];
}

const usePlanTypesWithIntent = ( props: Props ): PlanTypesWithIntent | null => {
	// TODO: refactor: sitePlanSlug === currentSitePlanSlug
	// TODO: refactor: pass siteId
	const { selectedPlan, sitePlanSlug, hideEnterprisePlan, currentSitePlanSlug, intent } = props;
	const isBloggerAvailable = isBloggerPlan( selectedPlan ) || isBloggerPlan( sitePlanSlug );

	// TODO:
	// this should fall into the processing function for the visible plans
	// however, the Enterprise plan isn't a real plan and lack of some required support
	// from the utility functions right now.
	const isEnterpriseAvailable = ! hideEnterprisePlan;

	let currentSitePlanType = null;
	if ( currentSitePlanSlug ) {
		currentSitePlanType = getPlan( currentSitePlanSlug )?.type;
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
		case 'blog-onboarding':
			return {
				intent,
				planTypes: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ],
			};
		case 'newsletter':
		case 'link-in-bio':
			return {
				intent,
				planTypes: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM ],
			};
		case 'new-hosted-site':
			return {
				intent,
				planTypes: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS, TYPE_ECOMMERCE ],
			};
		case 'new-hosted-site-hosting-flow':
			return {
				intent,
				planTypes: [ TYPE_BUSINESS, TYPE_ECOMMERCE ],
			};
		case 'plans-import':
			return {
				intent,
				planTypes: [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ],
			};
		case 'plans-ecommerce':
			return {
				intent,
				planTypes: [ TYPE_BUSINESS, TYPE_ECOMMERCE ],
			};
		case 'plugins': // is this used?
			return {
				intent,
				planTypes: [
					...( currentSitePlanType ? [ currentSitePlanType ] : [] ),
					TYPE_BUSINESS, // this can match the currentSitePlanType. needs investigation.
					TYPE_ECOMMERCE, // this can match the currentSitePlanType. needs investigation.
				],
			};
		default:
			return {
				intent: 'default',
				planTypes: defaultPlanTypes,
			};
	}
};

export default usePlanTypesWithIntent;
