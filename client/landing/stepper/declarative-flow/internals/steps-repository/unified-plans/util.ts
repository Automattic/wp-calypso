import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	FEATURE_UPLOAD_THEMES_PLUGINS,
	isEcommerce,
	planHasFeature,
	UrlFriendlyTermType,
} from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { isOnboardingGuidedFlow } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import { UnifiedPlansStepProps } from './unified-plans-step';

type SupportedIntervalTypes = Extract<
	UrlFriendlyTermType,
	'monthly' | 'yearly' | '2yearly' | '3yearly'
>;
const supportedIntervalTypes: SupportedIntervalTypes[] = [
	'monthly',
	'yearly',
	'2yearly',
	'3yearly',
];

export const getIntervalType = (
	path?: string,
	defaultType = 'yearly'
): SupportedIntervalTypes => {
	const url = path ?? window?.location?.href ?? '';
	const intervalType = getUrlParts( url ).searchParams.get( 'intervalType' ) || defaultType;

	return (
		supportedIntervalTypes.includes( intervalType as SupportedIntervalTypes )
			? intervalType
			: defaultType
	) as SupportedIntervalTypes;
};

export const shouldBasePlansOnSegment = (
	flowName: string,
	trailMapExperimentVariant: undefined | null | 'treatment_guided' | 'treatment_survey_only'
): boolean => {
	return isOnboardingGuidedFlow( flowName ) && trailMapExperimentVariant === 'treatment_guided';
};

export const buildUpgradeFunction = (
	planProps: {
		stepSectionName?: UnifiedPlansStepProps[ 'stepSectionName' ];
		launchSite?: UnifiedPlansStepProps[ 'launchSite' ];
		themeSlugWithRepo?: UnifiedPlansStepProps[ 'themeSlugWithRepo' ];
		flowName: UnifiedPlansStepProps[ 'flowName' ];
		stepName: UnifiedPlansStepProps[ 'stepName' ];
		selectedSite?: UnifiedPlansStepProps[ 'selectedSite' ] | null;
		additionalStepData?: UnifiedPlansStepProps[ 'additionalStepData' ];
		goToNextStep: NonNullable< UnifiedPlansStepProps[ 'goToNextStep' ] >;
		submitSignupStep: NonNullable< UnifiedPlansStepProps[ 'submitSignupStep' ] >;
	},
	cartItems?: MinimalRequestCartProduct[] | null
) => {
	const {
		additionalStepData,
		flowName,
		launchSite,
		selectedSite,
		stepName,
		stepSectionName,
		themeSlugWithRepo,
		goToNextStep,
		submitSignupStep,
	} = planProps;
	const planCartItem = getPlanCartItem( cartItems );

	if ( planCartItem ) {
		recordTracksEvent( 'calypso_signup_plan_select', {
			product_slug: planCartItem.product_slug,
			from_section: stepSectionName ? stepSectionName : 'default',
		} );

		// If we're inside the store signup flow and the cart item is a Business or eCommerce Plan,
		// set a flag on it. It will trigger Automated Transfer when the product is being
		// activated at the end of the checkout process.
		if (
			flowName === 'ecommerce' &&
			planHasFeature( planCartItem.product_slug, FEATURE_UPLOAD_THEMES_PLUGINS )
		) {
			planCartItem.extra = Object.assign( planCartItem.extra || {}, {
				is_store_signup: true,
			} );
		}
	} else {
		recordTracksEvent( 'calypso_signup_free_plan_select', {
			from_section: stepSectionName ? stepSectionName : 'default',
			flow: flowName,
		} );
	}

	const step = {
		stepName,
		stepSectionName,
		cartItems,
		...additionalStepData,
	};

	if ( selectedSite && flowName === 'site-selected' && ! planCartItem ) {
		submitSignupStep( step, { cartItems } );
		goToNextStep();
		return;
	}

	const signupVals = {
		cartItems,
		...( themeSlugWithRepo && { themeSlugWithRepo } ),
		...( launchSite && { comingSoon: 0 } ),
	};

	if ( planCartItem && isEcommerce( planCartItem ) ) {
		signupVals.themeSlugWithRepo = 'pub/twentytwentytwo';
	}
	submitSignupStep( step, signupVals );
	goToNextStep();
};
