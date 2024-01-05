import { PLAN_PREMIUM } from '@automattic/calypso-products';
import {
	Button,
	Gridicon,
	LoadingPlaceholder,
	Dialog,
	ScreenReaderText,
} from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import PlanPrice from 'calypso/my-sites/plan-price';
import usePricingMetaForGridPlans from 'calypso/my-sites/plans-features-main/hooks/data-store/use-pricing-meta-for-grid-plans';
import { useSelector } from 'calypso/state';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import useGlobalStylesUpgradeTranslations from './use-global-styles-upgrade-translations';
import './style.scss';

export interface PremiumGlobalStylesUpgradeModalProps {
	description?: string | React.ReactNode;
	checkout: () => void;
	closeModal: () => void;
	isOpen: boolean;
	tryStyle: () => void;
	/** Now we have 3 types of global styles including style variations, color variations, and font variations */
	numOfSelectedGlobalStyles?: number;
}

export default function PremiumGlobalStylesUpgradeModal( {
	description,
	checkout,
	closeModal,
	isOpen,
	tryStyle,
	numOfSelectedGlobalStyles = 1,
}: PremiumGlobalStylesUpgradeModalProps ) {
	const translate = useTranslate();
	const premiumPlanProduct = useSelector( ( state ) => getProductBySlug( state, PLAN_PREMIUM ) );
	const translations = useGlobalStylesUpgradeTranslations( { numOfSelectedGlobalStyles } );
	const isLoading = ! premiumPlanProduct;
	const pricingMeta = usePricingMetaForGridPlans( {
		planSlugs: [ PLAN_PREMIUM ],
		storageAddOns: null,
	} );

	const pricing = pricingMeta?.[ PLAN_PREMIUM ];
	const isPricingLoaded =
		pricing?.currencyCode && pricing?.originalPrice.monthly && pricing?.originalPrice.full;

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
				className={ classNames( 'upgrade-modal', 'premium-global-styles-upgrade-modal', {
					loading: isLoading,
				} ) }
				isFullScreen
				isVisible={ isOpen }
				onClose={ () => closeModal() }
			>
				{ isLoading && <LoadingEllipsis /> }
				{ ! isLoading && (
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
								<Button className="upgrade-modal__cancel" onClick={ () => tryStyle() }>
									{ translations.cancel }
								</Button>
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
								{ isPricingLoaded ? (
									<PlanPrice
										className="upgrade-modal__plan-price"
										currencyCode={ pricing?.currencyCode }
										rawPrice={ pricing?.originalPrice?.monthly }
										displayPerMonthNotation={ false }
										isLargeCurrency
										isSmallestUnit
									/>
								) : (
									<LoadingPlaceholder style={ { height: '48px' } } />
								) }
								<div className="upgrade-modal__plan-billing-time-frame">
									{ translate(
										'per month, {{span}}%(rawPrice)s{{/span}} billed annually, excl. taxes',
										{
											args: {
												rawPrice: isPricingLoaded
													? formatCurrency(
															pricing?.originalPrice.full ?? 0,
															pricing?.currencyCode ?? '',
															{
																stripZeros: true,
																isSmallestUnit: true,
															}
													  )
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
				) }
			</Dialog>
		</>
	);
}
