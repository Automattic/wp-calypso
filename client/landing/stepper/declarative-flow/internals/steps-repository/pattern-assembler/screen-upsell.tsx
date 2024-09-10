import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { Button, Gridicon, LoadingPlaceholder, PlanPrice } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import { NavigatorHeader } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import useGlobalStylesUpgradeTranslations from 'calypso/components/premium-global-styles-upgrade-modal/use-global-styles-upgrade-translations';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import './screen-upsell.scss';

interface Props {
	numOfSelectedGlobalStyles?: number;
	onCheckout: () => void;
	onTryStyle: () => void;
}

const ScreenUpsell = ( { numOfSelectedGlobalStyles = 1, onCheckout, onTryStyle }: Props ) => {
	const translate = useTranslate();
	const { title, description } = useScreen( 'upsell' );
	const translations = useGlobalStylesUpgradeTranslations( { numOfSelectedGlobalStyles } );
	const selectedSiteId = useSelector( getSelectedSiteId ) ?? undefined;
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ PLAN_PREMIUM ],
		siteId: selectedSiteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
		storageAddOns: null,
	} );
	const pricing = pricingMeta?.[ PLAN_PREMIUM ];
	const isPricingLoaded =
		pricing?.currencyCode && pricing?.originalPrice.monthly && pricing?.originalPrice.full;

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ title } /> }
				description={ description }
				hideBack
			/>
			<div className="screen-container__body">
				<div className="screen-upsell__plan">
					<div className="screen-upsell__plan-heading">
						{ translate( '%(planTitle)s plan', {
							args: { planTitle: translations.planTitle },
						} ) }
					</div>
					{ isPricingLoaded ? (
						<PlanPrice
							className="screen-upsell__plan-price"
							currencyCode={ pricing?.currencyCode }
							rawPrice={ pricing?.originalPrice?.monthly }
							displayPerMonthNotation={ false }
							isLargeCurrency
							isSmallestUnit
						/>
					) : (
						<LoadingPlaceholder style={ { height: '48px' } } />
					) }
					<div className="screen-upsell__plan-billing-time-frame">
						{ translate( 'per month, {{span}}%(rawPrice)s{{/span}} billed annually, excl. taxes', {
							args: {
								rawPrice: isPricingLoaded
									? formatCurrency( pricing?.originalPrice.full ?? 0, pricing?.currencyCode ?? '', {
											stripZeros: true,
											isSmallestUnit: true,
									  } )
									: '',
							},
							comment: 'excl. taxes is short for excluding taxes',
							components: {
								span: isPricingLoaded ? (
									<span />
								) : (
									<LoadingPlaceholder style={ { display: 'inline-block', width: '30%' } } />
								),
							},
						} ) }
					</div>
				</div>
				<strong className="screen-upsell__features-heading">
					{ translate( 'Included with the plan:' ) }
				</strong>
				<ul className="screen-upsell__features">
					{ translations.features.map( ( feature, i ) => (
						<li key={ i }>
							<Gridicon icon="checkmark" size={ 16 } />
							{ feature }
						</li>
					) ) }
				</ul>
			</div>
			<div className="screen-container__footer">
				<Button className="pattern-assembler__button" onClick={ onTryStyle }>
					{ translations.cancel }
				</Button>
				<Button className="pattern-assembler__button" primary onClick={ onCheckout }>
					{ translations.upgradeWithPlan }
				</Button>
			</div>
		</>
	);
};

export default ScreenUpsell;
