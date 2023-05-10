import { Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { localize, translate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { buildUpgradeFunction } from 'calypso/lib/signup/step-actions';
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

	const freePlanButton = (
		<Button
			onClick={ () => buildUpgradeFunction( { ...props, recordTracksEvent }, null ) }
			borderless
		/>
	);

	let subHeaderText = translate(
		"Pick one that's right for you and unlock features that help you grow. Or {{link}}start with another theme{{/link}}.",
		{ components: { link: freePlanButton } }
	);

	if ( ! isDesktop() ) {
		subHeaderText = translate( 'Choose a plan or {{link}}start with another theme{{/link}}.', {
			components: { link: freePlanButton },
		} );
	}

	return <PlansStep { ...props } { ...hidePlanProps } fallbackSubHeaderText={ subHeaderText } />;
}

export default localize( PlansThemePreselectedStep );
