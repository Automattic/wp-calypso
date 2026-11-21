import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';

const useGlobalStylesUpgradeTranslations = () => {
	const translate = useTranslate();
	const plans = Plans.usePlans( { coupon: undefined } );

	const upgradeToPlan = PLAN_PERSONAL;

	const planTitle = plans?.data?.[ upgradeToPlan ]?.productNameShort ?? '';

	const personalFeatures = [
		<strong>{ translate( 'Free domain for one year' ) }</strong>,
		<strong>{ translate( 'All premium themes' ) }</strong>,
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
			'You’ve selected sitewide styles that will only be visible to visitors after upgrading to the %(planTitle)s plan or higher.',
			{
				args: { planTitle },
				comment:
					'%(planTitle)s is the name of the plan that unlocks site styles. Site styles are the sitewide changes made in the Styles panel (Global Styles). Visitors only see them on a paid plan.',
			}
		),
		promotion: translate(
			'Upgrade now to unlock your sitewide styles and get access to tons of other features. Or you can decide later and try them out first.',
			{
				comment:
					'Site styles are the sitewide changes made in the Styles panel (Global Styles). Visitors only see them on a paid plan.',
			}
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
