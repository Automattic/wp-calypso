import { Button } from '@automattic/components';
import { FREE_THEME } from '@automattic/design-picker';
import { isDesktop } from '@automattic/viewport';
import { localize, translate } from 'i18n-calypso';
import { buildUpgradeFunction } from 'calypso/lib/signup/step-actions';
import { getHidePlanPropsBasedOnThemeType } from 'calypso/my-sites/plans-features-main/components/utils/utils';
import PlansStep from 'calypso/signup/steps/plans';

type SignupDependencies = {
	themeType: string | null;
	styleVariation: string | null;
};

function PlansThemePreselectedStep( props: object & { signupDependencies: SignupDependencies } ) {
	const hidePlanProps = getHidePlanPropsBasedOnThemeType(
		props.signupDependencies.themeType || ''
	);

	const freePlanButton = (
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		<Button onClick={ () => buildUpgradeFunction( { ...( props as any ) }, null ) } borderless />
	);

	let subHeaderText = translate(
		"Pick one that's right for you and unlock features that help you grow. Or {{link}}start with another theme{{/link}}.",
		{ components: { link: freePlanButton } }
	);

	if ( ! isDesktop() ) {
		subHeaderText = translate( 'Choose a plan or {{link}}start with another theme.{{/link}}', {
			components: { link: freePlanButton },
		} );
	}

	/**
	 * Keep the default subheader text for free themes.
	 */
	const fallbackSubheaderTextProps =
		FREE_THEME === props.signupDependencies.themeType
			? {}
			: { fallbackSubHeaderText: subHeaderText };

	return (
		<PlansStep { ...( props as any ) } { ...hidePlanProps } { ...fallbackSubheaderTextProps } />
	);
}

export default localize( PlansThemePreselectedStep );
