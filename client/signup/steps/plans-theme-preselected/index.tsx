import { localize } from 'i18n-calypso';
import PlansStep from 'calypso/signup/steps/plans';

type SignupDependencies = {
	themeType: string | null;
	styleVariation: string | null;
};

/**
 * Determine which plans should be displayed based on the signupDependencies.
 *
 * Instead of making an API call (which is expensive), we are retrieving the information based on the query Params that were passed when the flow started.
 *
 * @param signupDependencies
 */
function getHidePlanPropsBasedOnSignupDependencies(
	signupDependencies: SignupDependencies
): object {
	/**
	 * Marketplace themes: Display only Business and eCommerce plans.
	 */
	if (
		signupDependencies.themeType === 'dot-org' ||
		signupDependencies.themeType === 'managed-externally' ||
		signupDependencies.themeType === 'woocommerce'
	) {
		return { hidePremiumPlan: true, hidePersonalPlan: true };
	}

	/**
	 * Premium themes: Display Premium, Business and eCommerce
	 */
	if ( signupDependencies.themeType === 'premium' ) {
		return { hidePersonalPlan: true };
	}

	return {};
}

function PlansThemePreselectedStep( props: object & { signupDependencies: SignupDependencies } ) {
	const hidePlanProps = getHidePlanPropsBasedOnSignupDependencies( props.signupDependencies );

	return <PlansStep { ...props } { ...hidePlanProps } />;
}

export default localize( PlansThemePreselectedStep );
