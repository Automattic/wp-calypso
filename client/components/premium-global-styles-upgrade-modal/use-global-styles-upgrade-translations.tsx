import { PLAN_PREMIUM, getPlan } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';

interface Props {
	numOfSelectedGlobalStyles?: number;
}

const useGlobalStylesUpgradeTranslations = ( { numOfSelectedGlobalStyles = 1 }: Props ) => {
	const translate = useTranslate();
	const planProduct = useSelector( ( state ) => getProductBySlug( state, PLAN_PREMIUM ) );
	const plan = getPlan( PLAN_PREMIUM );
	const features = [
		<strong>{ translate( 'Free domain for one year' ) }</strong>,
		<strong>{ translate( 'Premium themes' ) }</strong>,
		translate( 'Style customization' ),
		translate( 'Live chat support' ),
		translate( 'Ad-free experience' ),
		translate( 'Earn with WordAds' ),
	];

	return {
		featuresTitle: translate( 'Included with your Premium plan' ),
		features: features,
		description: translate(
			'You’ve selected a custom style that will only be visible to visitors after upgrading to the Premium plan or higher.',
			'You’ve selected custom styles that will only be visible to visitors after upgrading to the Premium plan or higher.',
			{ count: numOfSelectedGlobalStyles }
		),
		promotion: translate(
			'Upgrade now to unlock your custom style and get access to tons of other features. Or you can decide later and try it out first.',
			'Upgrade now to unlock your custom styles and get access to tons of other features. Or you can decide later and try them out first.',
			{ count: numOfSelectedGlobalStyles }
		),
		cancel: translate( 'Decide later' ),
		upgrade: translate( 'Upgrade plan' ),
		upgradeWithPlan: translate( 'Get %(planTitle)s for %(displayPrice)s/month', {
			args: {
				planTitle: plan?.getTitle() ?? '',
				displayPrice: planProduct?.cost_per_month_display ?? '',
			},
		} ),
	};
};

export default useGlobalStylesUpgradeTranslations;
