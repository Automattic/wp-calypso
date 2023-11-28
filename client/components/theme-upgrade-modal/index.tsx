import {
	FEATURE_ACCEPT_PAYMENTS,
	FEATURE_AD_FREE_EXPERIENCE,
	FEATURE_BANDWIDTH,
	FEATURE_BURST,
	FEATURE_CDN,
	FEATURE_CPUS,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_GLOBAL_EDGE_CACHING,
	FEATURE_ISOLATED_INFRA,
	FEATURE_LIVE_CHAT_SUPPORT,
	FEATURE_MANAGED_HOSTING,
	FEATURE_MULTI_SITE,
	FEATURE_NO_ADS,
	FEATURE_PLUGINS_THEMES,
	FEATURE_PREMIUM_THEMES_V2,
	FEATURE_STYLE_CUSTOMIZATION,
	FEATURE_VIDEOPRESS_JP,
	FEATURE_WAF_V2,
	FEATURE_WORDADS,
} from '@automattic/calypso-products';
import { Button, Gridicon, Dialog, ScreenReaderText } from '@automattic/components';
import { ProductsList } from '@automattic/data-stores';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useBreakpoint } from '@automattic/viewport-react';
import { Tooltip } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import classNames from 'classnames';
import i18n, { useTranslate } from 'i18n-calypso';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import bundleSettings from 'calypso/my-sites/theme/bundle-settings';
import { useSelector } from 'calypso/state';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import { useThemeDetails } from 'calypso/state/themes/hooks/use-theme-details';
import { isExternallyManagedTheme, getThemeSoftwareSet } from 'calypso/state/themes/selectors';
import './style.scss';

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
	header: JSX.Element | null;
	text: JSX.Element | null;
	price: JSX.Element | null;
	action: JSX.Element | null;
}

export const ThemeUpgradeModal = ( {
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
	const isDesktop = useBreakpoint( '>782px' );

	// Check current theme: Does it have a plugin bundled?
	const theme_software_set = theme?.data?.taxonomies?.theme_software_set?.length;
	const showBundleVersion = theme_software_set;
	const isExternallyManaged = useSelector( ( state ) => isExternallyManagedTheme( state, slug ) );

	const themeSoftwareSet = useSelector( ( state ) =>
		getThemeSoftwareSet( state, theme?.data?.id )
	);

	const premiumPlanProduct = useSelect(
		( select ) => select( ProductsList.store ).getProductBySlug( 'value_bundle' ),
		[]
	);
	const businessPlanProduct = useSelect(
		( select ) => select( ProductsList.store ).getProductBySlug( 'business-bundle' ),
		[]
	);
	const monthlyBusinessPlanProduct = useSelect(
		( select ) => select( ProductsList.store ).getProductBySlug( 'business-bundle-monthly' ),
		[]
	);

	//Wait until we have theme and product data to show content
	const isLoading = ! premiumPlanProduct || ! businessPlanProduct || ! theme.data;

	const getStandardPurchaseModalData = (): UpgradeModalContent => {
		const planPrice = premiumPlanProduct?.combined_cost_display;

		return {
			header: (
				<h1 className="theme-upgrade-modal__heading">
					{ translate( 'Unlock this premium theme' ) }
				</h1>
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
				<div className="theme-upgrade-modal__actions bundle">
					<Button className="theme-upgrade-modal__cancel" onClick={ () => closeModal() }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button
						className="theme-upgrade-modal__upgrade-plan"
						primary
						onClick={ () => checkout() }
					>
						{ translate( 'Upgrade to activate' ) }
					</Button>
				</div>
			),
		};
	};

	const getBundledFirstPartyPurchaseModalData = (): UpgradeModalContent => {
		const businessPlanPrice = businessPlanProduct?.combined_cost_display;
		const themeSoftware = themeSoftwareSet[ 0 ];

		if ( ! bundleSettings[ themeSoftware ] ) {
			return {
				header: null,
				text: null,
				price: null,
				action: null,
			};
		}

		const settings = bundleSettings[ themeSoftware ];
		const bundleName = settings.name;
		const bundledPluginMessage = settings.bundledPluginMessage;
		const color = settings.color;
		const Icon = settings.iconComponent;

		return {
			header: (
				<>
					<div className="theme-upgrade-modal__logo" style={ { backgroundColor: color } }>
						<Icon />
					</div>
					<h1 className="theme-upgrade-modal__heading bundle">
						{ translate( 'Unlock this %(bundleName)s theme', { args: { bundleName } } ) }
					</h1>
				</>
			),
			text: (
				<p>
					{ bundledPluginMessage }{ ' ' }
					{ translate(
						'Upgrade to a Business plan to select this theme and unlock all its features. It’s %s per year with a 14-day money-back guarantee.',
						{
							args: businessPlanPrice,
						}
					) }
				</p>
			),
			price: null,
			action: (
				<div className="theme-upgrade-modal__actions bundle">
					<Button className="theme-upgrade-modal__cancel" onClick={ () => closeModal() }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button
						className="theme-upgrade-modal__upgrade-plan"
						primary
						onClick={ () => checkout() }
					>
						{ translate( 'Upgrade Plan' ) }
					</Button>
				</div>
			),
		};
	};

	const getExternallyManagedPurchaseModalData = (): UpgradeModalContent => {
		const businessPlanPrice = monthlyBusinessPlanProduct?.combined_cost_display;
		const productPrice = marketplaceProduct?.cost_display;

		const businessPlanPriceText =
			monthlyBusinessPlanProduct?.product_term === 'year'
				? translate( '%(cost)s per year', { args: { cost: businessPlanPrice || '' } } )
				: translate( '%(cost)s per month', { args: { cost: businessPlanPrice || '' } } );

		const productPriceText =
			marketplaceProduct?.product_term === 'year'
				? translate( '%(cost)s per year', { args: { cost: productPrice || '' } } )
				: translate( '%(cost)s per month', { args: { cost: productPrice || '' } } );

		return {
			header: (
				<h1 className="theme-upgrade-modal__heading bundle externally-managed">
					{ isDesktop
						? translate( 'Unlock this partner theme' )
						: translate( 'Unlock this theme' ) }
				</h1>
			),
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
						<div className="theme-upgrade-modal__price-summary">
							{ isMarketplaceThemeSubscriptionNeeded && (
								<div className="theme-upgrade-modal__price-item">
									<label>{ theme.data?.name }</label>
									<label className="theme-upgrade-modal__price-value">
										<strong>{ productPriceText }</strong>
									</label>
								</div>
							) }
							{ isMarketplacePlanSubscriptionNeeeded && (
								<div className="theme-upgrade-modal__price-item">
									<label>{ translate( 'Business plan' ) }</label>
									<label className="theme-upgrade-modal__price-value">
										<strong>{ businessPlanPriceText }</strong>
									</label>
								</div>
							) }
						</div>
					</div>
				</>
			),
			price: null,
			action: (
				<div className="theme-upgrade-modal__actions bundle externally-managed">
					<Button className="theme-upgrade-modal__cancel" onClick={ () => closeModal() }>
						{ translate( 'Cancel' ) }
					</Button>
					<Button
						className="theme-upgrade-modal__upgrade-plan"
						primary
						onClick={ () => checkout() }
					>
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
			FEATURE_PLUGINS_THEMES,
			FEATURE_STYLE_CUSTOMIZATION,
			FEATURE_LIVE_CHAT_SUPPORT,
			FEATURE_NO_ADS,
			FEATURE_ACCEPT_PAYMENTS,
			FEATURE_MANAGED_HOSTING,
			FEATURE_BANDWIDTH,
			FEATURE_GLOBAL_EDGE_CACHING,
			FEATURE_CDN,
			FEATURE_MULTI_SITE,
			FEATURE_VIDEOPRESS_JP,
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
		isExternallyManaged && featureList.length === 0 ? null : (
			<div className="theme-upgrade-modal__included">
				<h2>{ featureListHeader }</h2>
				<ul>
					{ featureList.map( ( feature, i ) => (
						<li key={ i } className="theme-upgrade-modal__included-item">
							<Tooltip text={ feature.getDescription?.() as string } position="top left">
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
			className={ classNames( 'theme-upgrade-modal', { loading: isLoading } ) }
			isVisible={ isOpen }
			onClose={ () => closeModal() }
			isFullScreen
		>
			{ isLoading && <LoadingEllipsis /> }
			{ ! isLoading && (
				<>
					<div className="theme-upgrade-modal__col">
						{ modalData.header }
						{ modalData.text }
						{ modalData.price }
						{ /* We don't want to show features on mobile for Partner themes */ }
						{ ! isExternallyManaged && features }
						{ modalData.action }
					</div>
					<div className="theme-upgrade-modal__col">{ features }</div>
					<Button className="theme-upgrade-modal__close" borderless onClick={ () => closeModal() }>
						<Gridicon icon="cross" size={ 12 } />
						<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
					</Button>
				</>
			) }
		</Dialog>
	);
};
