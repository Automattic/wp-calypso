import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { Button, Gridicon, PremiumBadge } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { NavigatorHeader } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import QueryPlans from 'calypso/components/data/query-plans';
import useGlobalStylesUpgradeTranslations from 'calypso/components/premium-global-styles-upgrade-modal/use-global-styles-upgrade-translations';
import PlanPrice from 'calypso/my-sites/plan-price';
import usePricingMetaForGridPlans from 'calypso/my-sites/plans-features-main/hooks/data-store/use-pricing-meta-for-grid-plans';
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
	const pricingMeta = usePricingMetaForGridPlans( {
		planSlugs: [ PLAN_PREMIUM ],
		storageAddOns: null,
	} );

	const pricing = pricingMeta?.[ PLAN_PREMIUM ];

	return (
		<>
			<QueryPlans />
			<NavigatorHeader
				title={ <NavigatorTitle title={ title } /> }
				description={ description }
				hideBack
			/>
			<div className="screen-container__body">
				{ pricing && pricing.originalPrice.full && (
					<div className="screen-upsell__plan">
						<div className="screen-upsell__plan-heading">
							{ translate( '%(planTitle)s plan', {
								args: { planTitle: translations.planTitle },
							} ) }
						</div>
						<PlanPrice
							className="screen-upsell__plan-price"
							currencyCode={ pricing.currencyCode }
							rawPrice={ pricing.originalPrice.monthly }
							displayPerMonthNotation={ false }
							isLargeCurrency
							isSmallestUnit
						/>
						<div className="screen-upsell__plan-billing-time-frame">
							{ translate( 'per month, %(rawPrice)s billed annually, Excl. Taxes', {
								args: {
									rawPrice: formatCurrency(
										pricing.originalPrice.full,
										pricing.currencyCode ?? '',
										{
											stripZeros: true,
											isSmallestUnit: true,
										}
									),
								},
								comment: 'Excl. Taxes is short for excluding taxes',
							} ) }
						</div>
					</div>
				) }
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
				<strong className="screen-upsell__heading">
					{ translate( 'Premium styles' ) }
					<PremiumBadge
						shouldHideTooltip
						shouldCompactWithAnimation
						labelText={ translate( 'Upgrade' ) }
					/>
				</strong>
				<div className="screen-upsell__description">
					<p>
						{ translate(
							'Your colors and fonts choices are exclusive to the Premium plan and above.'
						) }
					</p>
				</div>
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
