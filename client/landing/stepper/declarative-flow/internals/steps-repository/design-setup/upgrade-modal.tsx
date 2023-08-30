import {
	FEATURE_AD_FREE_EXPERIENCE,
	FEATURE_BANDWIDTH,
	FEATURE_BURST,
	FEATURE_CDN,
	FEATURE_CPUS,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_GLOBAL_EDGE_CACHING,
	FEATURE_ISOLATED_INFRA,
	FEATURE_LIVE_CHAT_SUPPORT,
	FEATURE_PREMIUM_THEMES_V2,
	FEATURE_STYLE_CUSTOMIZATION,
	FEATURE_WAF_V2,
	FEATURE_WORDADS,
} from '@automattic/calypso-products';
import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import { ProductsList } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { ExternalLink, Tooltip } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import classNames from 'classnames';
import i18n, { useTranslate } from 'i18n-calypso';
import wooCommerceImage from 'calypso/assets/images/onboarding/woo-commerce.svg';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useThemeDetails } from 'calypso/landing/stepper/hooks/use-theme-details';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import { useSelector } from 'calypso/state';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import { isExternallyManagedTheme } from 'calypso/state/themes/selectors';
import './upgrade-modal.scss';

interface UpgradeModalProps {
	/* Theme slug */
	slug: string;
	isOpen: boolean;
	isMarketplaceThemeSubscriptionNeeded?: boolean;
	isMarketplacePlanSubscriptionNeeeded?: boolean;
	marketplaceProduct?: ProductListItem;
	closeModal: () => void;
	checkout: () => void;
}

interface UpgradeModalContent {
	header: JSX.Element;
	text: JSX.Element;
	price: JSX.Element | null;
	action: JSX.Element;
}

const UpgradeModal = ( {
	slug,
	isOpen,
	isMarketplaceThemeSubscriptionNeeded,
	isMarketplacePlanSubscriptionNeeeded,
	marketplaceProduct,
	closeModal,
	checkout,
}: UpgradeModalProps ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const theme = useThemeDetails( slug );
	// Check current theme: Does it have a plugin bundled?
	const theme_software_set = theme?.data?.taxonomies?.theme_software_set?.length;
	const showBundleVersion = theme_software_set;
	const isExternallyManaged = useSelector( ( state ) => isExternallyManagedTheme( state, slug ) );

	const premiumPlanProduct = useSelect(
		( select ) => select( ProductsList.store ).getProductBySlug( 'value_bundle' ),
		[]
	);
	const businessPlanProduct = useSelect(
		( select ) => select( ProductsList.store ).getProductBySlug( 'business-bundle' ),
		[]
	);

	//Wait until we have theme and product data to show content
	const isLoading = ! premiumPlanProduct || ! businessPlanProduct || ! theme.data;

	const getStandardPurchaseModalData = (): UpgradeModalContent => {
		const planPrice = premiumPlanProduct?.combined_cost_display;

		return {
			header: (
				<h1 className="upgrade-modal__heading">{ translate( 'Unlock this premium theme' ) }</h1>
			),
			text: (
				<p>
					{ translate(
						'Get access to our Premium themes, and a ton of other features, with a subscription to the Premium plan. It’s {{strong}}%s{{/strong}} a year, risk-free with a 14-day money-back guarantee.',
						{
							components: {
								strong: <strong />,
							},
							args: planPrice,
						}
					) }
				</p>
			),
			price: null,
			action: (
				<div className="upgrade-modal__actions bundle">
					<Button className="upgrade-modal__cancel" onClick={ () => closeModal() }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button className="upgrade-modal__upgrade-plan" primary onClick={ () => checkout() }>
						{ translate( 'Upgrade to activate' ) }
					</Button>
				</div>
			),
		};
	};

	const getBundledFirstPartyPurchaseModalData = (): UpgradeModalContent => {
		const businessPlanPrice = businessPlanProduct?.combined_cost_display;
		return {
			header: (
				<>
					<img src={ wooCommerceImage } alt="WooCommerce" className="upgrade-modal__woo-logo" />
					<h1 className="upgrade-modal__heading bundle">
						{ translate( 'Unlock this WooCommerce theme' ) }
					</h1>
				</>
			),
			text: (
				<p>
					{ translate(
						'This theme comes bundled with {{link}}WooCommerce{{/link}} plugin. Upgrade to a Business plan to select this theme and unlock all its features. It’s %s per year with a 14-day money-back guarantee.',
						{
							components: {
								link: <ExternalLink children={ null } href="https://woocommerce.com/" />,
							},
							args: businessPlanPrice,
						}
					) }
				</p>
			),
			price: null,
			action: (
				<div className="upgrade-modal__actions bundle">
					<Button className="upgrade-modal__cancel" onClick={ () => closeModal() }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button className="upgrade-modal__upgrade-plan" primary onClick={ () => checkout() }>
						{ translate( 'Upgrade Plan' ) }
					</Button>
				</div>
			),
		};
	};

	const getExternallyManagedPurchaseModalData = (): UpgradeModalContent => {
		const businessPlanPrice = businessPlanProduct?.combined_cost_display;
		const productPrice = marketplaceProduct?.cost_display;

		return {
			header: <h1 className="upgrade-modal__heading bundle">{ translate( 'Upgrade to buy' ) }</h1>,
			text: (
				<>
					<p>
						{ translate(
							'This partner theme is only available to buy on the Business or eCommerce plans.'
						) }
					</p>
					<div>
						<label>
							<strong>{ translate( 'To activate this theme you need:' ) }</strong>
						</label>
						<br />
						<div className="upgrade-modal__price-summary">
							{ isMarketplaceThemeSubscriptionNeeded && (
								<div className="upgrade-modal__price-item">
									<label>{ theme.data?.name }</label>
									<label>
										<strong>{ productPrice }</strong>
									</label>
								</div>
							) }
							{ isMarketplacePlanSubscriptionNeeeded && (
								<div className="upgrade-modal__price-item">
									<label>{ translate( 'Business plan' ) }</label>
									<label>
										<strong>{ businessPlanPrice }</strong>
									</label>
								</div>
							) }
						</div>
					</div>
				</>
			),
			price: null,
			action: (
				<div className="upgrade-modal__actions bundle">
					<Button className="upgrade-modal__cancel" onClick={ () => closeModal() }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button className="upgrade-modal__upgrade-plan" primary onClick={ () => checkout() }>
						{ translate( 'Continue' ) }
					</Button>
				</div>
			),
		};
	};

	const getStandardPurchaseFeatureList = () => {
		return getPlanFeaturesObject( [
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_PREMIUM_THEMES_V2,
			FEATURE_STYLE_CUSTOMIZATION,
			FEATURE_LIVE_CHAT_SUPPORT,
			FEATURE_AD_FREE_EXPERIENCE,
			FEATURE_WORDADS,
		] );
	};

	const getBundledFirstPartyPurchaseFeatureList = () => {
		return getPlanFeaturesObject( [
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_PREMIUM_THEMES_V2,
			FEATURE_STYLE_CUSTOMIZATION,
			FEATURE_LIVE_CHAT_SUPPORT,
			FEATURE_AD_FREE_EXPERIENCE,
			FEATURE_WORDADS,
			FEATURE_BANDWIDTH,
			FEATURE_GLOBAL_EDGE_CACHING,
			FEATURE_BURST,
			FEATURE_WAF_V2,
			FEATURE_CDN,
			FEATURE_CPUS,
			FEATURE_ISOLATED_INFRA,
		] );
	};

	const getExternallyManagedFeatureList = () => {
		return getPlanFeaturesObject( [
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_PREMIUM_THEMES_V2,
			FEATURE_LIVE_CHAT_SUPPORT,
		] );
	};

	let modalData = null;
	let featureList = null;
	let featureListHeader = null;

	if ( showBundleVersion ) {
		modalData = getBundledFirstPartyPurchaseModalData();
		featureList = getBundledFirstPartyPurchaseFeatureList();
		featureListHeader =
			isEnglishLocale || i18n.hasTranslation( 'Included with your Business plan' )
				? translate( 'Included with your Business plan' )
				: translate( 'Included with your purchase' );
	} else if ( isExternallyManaged ) {
		modalData = getExternallyManagedPurchaseModalData();
		featureList = getExternallyManagedFeatureList();
		featureListHeader =
			isEnglishLocale || i18n.hasTranslation( 'Included with your Business plan' )
				? translate( 'Included with your Business plan' )
				: translate( 'Included with your purchase' );
	} else {
		modalData = getStandardPurchaseModalData();
		featureList = getStandardPurchaseFeatureList();
		featureListHeader =
			isEnglishLocale || i18n.hasTranslation( 'Included with your Premium plan' )
				? translate( 'Included with your Premium plan' )
				: translate( 'Included with your purchase' );
	}

	const features =
		isExternallyManaged && ! isMarketplacePlanSubscriptionNeeeded ? null : (
			<div className="upgrade-modal__included">
				<h2>{ featureListHeader }</h2>
				<ul>
					{ featureList.map( ( feature, i ) => (
						<li key={ i } className="upgrade-modal__included-item">
							<Tooltip text={ feature.getDescription?.() } position="top left">
								<div>
									<Gridicon icon="checkmark" size={ 16 } />
									{ feature.getTitle() }
								</div>
							</Tooltip>
						</li>
					) ) }
				</ul>
			</div>
		);

	return (
		<Dialog
			className={ classNames( 'upgrade-modal', { loading: isLoading } ) }
			isVisible={ isOpen }
			onClose={ () => closeModal() }
			isFullScreen
		>
			{ isLoading && <LoadingEllipsis /> }
			{ ! isLoading && (
				<>
					<div className="upgrade-modal__col">
						{ modalData.header }
						{ modalData.text }
						{ modalData.price }
						{ features }
						{ modalData.action }
					</div>
					<div className="upgrade-modal__col">{ features }</div>
					<Button className="upgrade-modal__close" borderless onClick={ () => closeModal() }>
						<Gridicon icon="cross" size={ 12 } />
						<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
					</Button>
				</>
			) }
		</Dialog>
	);
};

export default UpgradeModal;
