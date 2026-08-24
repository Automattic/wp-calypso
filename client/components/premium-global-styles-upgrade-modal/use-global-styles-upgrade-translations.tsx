import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';

interface Props {
	numOfSelectedGlobalStyles?: number;
}

const useGlobalStylesUpgradeTranslations = ( { numOfSelectedGlobalStyles = 1 }: Props ) => {
	const translate = useTranslate();
	const plans = Plans.usePlans( { coupon: undefined } );

	const upgradeToPlan = PLAN_PERSONAL;

	const planTitle = plans?.data?.[ upgradeToPlan ]?.productNameShort ?? '';

	const personalFeatures = [
		<strong>{ translate( 'Free domain for one year' ) }</strong>,
		<strong>{ translate( 'Dozens of premium themes' ) }</strong>,
		translate( 'Style customization' ),
		translate( 'Ad-free experience' ),
	];

	return {
		planTitle,
		featuresTitle: translate( 'Included with your %(planTitle)s plan', {
			args: { planTitle },
		} ),
		features: personalFeatures,
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
		try: translate( 'Decide later' ),
		cancel: translate( 'Cancel' ),
		upgrade: translate( 'Upgrade plan' ),
		upgradeWithPlan: translate( 'Get %(planTitle)s plan', {
			args: { planTitle },
		} ),
	};
};

export default useGlobalStylesUpgradeTranslations;
