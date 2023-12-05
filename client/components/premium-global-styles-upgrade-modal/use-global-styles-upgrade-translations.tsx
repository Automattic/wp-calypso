import { PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';

interface Props {
	numOfSelectedGlobalStyles?: number;
}

const useGlobalStylesUpgradeTranslations = ( { numOfSelectedGlobalStyles = 1 }: Props ) => {
	const translate = useTranslate();
	const plan = getPlan( PLAN_PREMIUM );
	const planTitle = plan?.getTitle() ?? '';
	const features = [
		<strong>{ translate( 'Free domain for one year' ) }</strong>,
		<strong>{ translate( 'Premium themes' ) }</strong>,
		translate( 'Style customization' ),
		translate( 'Live chat support' ),
		translate( 'Ad-free experience' ),
		translate( 'Earn with WordAds' ),
	];

	return {
		planTitle,
		featuresTitle: translate( 'Included with your Premium plan' ),
		features: features,
		description: translate(
			'You’ve selected a premium style that will only be visible to visitors after upgrading to the %(planTitle)s plan or higher.',
			'You’ve selected premium styles that will only be visible to visitors after upgrading to the %(planTitle)s plan or higher.',
			{
				count: numOfSelectedGlobalStyles,
				args: { planTitle },
			}
		),
		promotion: translate(
			'Upgrade now to unlock your premium style and get access to tons of other features. Or you can decide later and try it out first.',
			'Upgrade now to unlock your premium styles and get access to tons of other features. Or you can decide later and try them out first.',
			{ count: numOfSelectedGlobalStyles }
		),
		cancel: translate( 'Decide later' ),
		upgrade: translate( 'Upgrade plan' ),
		upgradeWithPlan: translate( 'Get %(planTitle)s plan', {
			args: { planTitle },
		} ),
	};
};

export default useGlobalStylesUpgradeTranslations;
