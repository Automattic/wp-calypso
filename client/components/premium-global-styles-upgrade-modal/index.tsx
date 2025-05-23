import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import { Button, Gridicon, Dialog, ScreenReaderText, PlanPrice } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { useSiteGlobalStylesOnPersonal } from 'calypso/state/sites/hooks/use-site-global-styles-on-personal';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useGlobalStylesUpgradeTranslations from './use-global-styles-upgrade-translations';
import './style.scss';

export interface PremiumGlobalStylesUpgradeModalProps {
	description?: string | React.ReactNode;
	checkout: () => void;
	closeModal: () => void;
	isOpen: boolean;
	tryStyle?: ( () => void ) | undefined;
	/** Now we have 3 types of global styles including style variations, color variations, and font variations */
	numOfSelectedGlobalStyles?: number;
}

export default function PremiumGlobalStylesUpgradeModal( {
	description,
	checkout,
	closeModal,
	isOpen,
	tryStyle = undefined,
	numOfSelectedGlobalStyles = 1,
}: PremiumGlobalStylesUpgradeModalProps ) {
	const translate = useTranslate();
	// @TODO Cleanup once the test phase is over.
	const upgradeToPlan = useSiteGlobalStylesOnPersonal() ? PLAN_PERSONAL : PLAN_PREMIUM;
	const premiumPlanProduct = useSelector( ( state ) => getProductBySlug( state, upgradeToPlan ) );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const translations = useGlobalStylesUpgradeTranslations( { numOfSelectedGlobalStyles } );
	const isPremiumPlanProductLoaded = !! premiumPlanProduct;
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		coupon: undefined,
		planSlugs: [ upgradeToPlan ],
		siteId: selectedSiteId,
		useCheckPlanAvailabilityForPurchase,
	} );

	const pricing = pricingMeta?.[ upgradeToPlan ];
	const isPricingLoaded =
		pricing?.currencyCode && pricing?.originalPrice.monthly && pricing?.originalPrice.full;

	const isLoaded = isPremiumPlanProductLoaded && isPricingLoaded;

	const featureList = (
		<div className="upgrade-modal__included">
			<h2>{ translations.featuresTitle }</h2>
			<ul>
				{ translations.features.map( ( feature, i ) => (
					<li key={ i } className="upgrade-modal__included-item">
						<Gridicon icon="checkmark" size={ 16 } />
						{ feature }
					</li>
				) ) }
			</ul>
		</div>
	);

	return (
		<>
			<QueryProductsList />
			<Dialog
				className={ clsx( 'upgrade-modal', 'premium-global-styles-upgrade-modal', {
					loading: ! isLoaded,
				} ) }
				isFullScreen
				isVisible={ isOpen }
				onClose={ () => closeModal() }
			>
				{ isLoaded ? (
					<>
						<div className="upgrade-modal__col">
							<h1 className="upgrade-modal__heading">{ translate( 'Unlock premium styles' ) }</h1>
							{ description ?? (
								<>
									<p>{ translations.description }</p>
									<p>{ translations.promotion }</p>
								</>
							) }
							{ featureList }
							<div className="upgrade-modal__actions bundle">
								{ tryStyle ? (
									<Button className="upgrade-modal__cancel" onClick={ () => tryStyle() }>
										{ translations.try }
									</Button>
								) : (
									<Button className="upgrade-modal__cancel" onClick={ closeModal }>
										{ translations.cancel }
									</Button>
								) }
								<Button
									className="upgrade-modal__upgrade-plan"
									primary
									onClick={ () => checkout() }
								>
									{ translations.upgrade }
								</Button>
							</div>
						</div>
						<div className="upgrade-modal__col">
							<div className="upgrade-modal__plan">
								<div className="upgrade-modal__plan-heading">
									{ translate( '%(planTitle)s plan', {
										args: { planTitle: translations.planTitle },
									} ) }
								</div>
								<PlanPrice
									className="upgrade-modal__plan-price"
									currencyCode={ pricing?.currencyCode }
									rawPrice={ pricing?.originalPrice?.monthly }
									displayPerMonthNotation={ false }
									isLargeCurrency
									isSmallestUnit
								/>
								<div className="upgrade-modal__plan-billing-time-frame">
									{ translate(
										'per month, {{span}}%(rawPrice)s{{/span}} billed annually, excl. taxes',
										{
											args: {
												rawPrice: formatCurrency(
													pricing?.originalPrice.full ?? 0,
													pricing?.currencyCode ?? '',
													{
														stripZeros: true,
														isSmallestUnit: true,
													}
												),
											},
											comment: 'excl. taxes is short for excluding taxes',
											components: {
												span: <span />,
											},
										}
									) }
								</div>
							</div>
							{ featureList }
						</div>
						<Button className="upgrade-modal__close" borderless onClick={ () => closeModal() }>
							<Gridicon icon="cross" size={ 12 } />
							<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
						</Button>
					</>
				) : (
					<LoadingEllipsis />
				) }
			</Dialog>
		</>
	);
}
