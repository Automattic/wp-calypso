import {
	FEATURE_ACCEPT_PAYMENTS,
	FEATURE_AD_FREE_EXPERIENCE,
	FEATURE_BANDWIDTH,
	FEATURE_BURST,
	FEATURE_CDN,
	FEATURE_CPUS,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_FAST_DNS,
	FEATURE_GLOBAL_EDGE_CACHING,
	FEATURE_ISOLATED_INFRA,
	FEATURE_PRIORITY_24_7_SUPPORT,
	FEATURE_MANAGED_HOSTING,
	FEATURE_MULTI_SITE,
	FEATURE_NO_ADS,
	FEATURE_PLUGINS_THEMES,
	FEATURE_STYLE_CUSTOMIZATION,
	FEATURE_VIDEOPRESS_JP,
	FEATURE_WAF_V2,
	FEATURE_WORDADS,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	getPlan,
	getPlanFeaturesObject,
} from '@automattic/calypso-products';
import { Button, Dialog, ScreenReaderText } from '@automattic/components';
import { ProductsList } from '@automattic/data-stores';
import { useBreakpoint } from '@automattic/viewport-react';
import { Tooltip } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { Icon as WpIcon, check, close } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useBundleSettings } from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import { useThemeDetails } from 'calypso/state/themes/hooks/use-theme-details';
import { ThemeSoftwareSet } from 'calypso/types';
import './style.scss';

export type UpgradeModalClosedBy = 'close_icon' | 'cancel_button' | 'dialog_action';

interface UpgradeModalProps {
	additionalClassNames?: string;
	additionalOverlayClassNames?: string;
	/* Theme slug */
	slug: string;
	isOpen: boolean;
	isMarketplaceThemeSubscriptionNeeded?: boolean;
	isMarketplacePlanSubscriptionNeeeded?: boolean;
	requiredPlan: string;
	marketplaceProduct?: ProductListItem;
	closeModal: ( closedBy?: UpgradeModalClosedBy ) => void;
	checkout: () => void;
}

interface UpgradeModalContent {
	header: JSX.Element | null;
	text: JSX.Element | null;
	price: JSX.Element | null;
	action: JSX.Element | null;
}

/**
 * - This component provides users with details about a specific theme and outlines the plan they need to upgrade to.
 */
export const ThemeUpgradeModal = ( {
	additionalClassNames,
	additionalOverlayClassNames,
	slug,
	isOpen,
	isMarketplaceThemeSubscriptionNeeded,
	isMarketplacePlanSubscriptionNeeeded,
	requiredPlan,
	marketplaceProduct,
	closeModal,
	checkout,
}: UpgradeModalProps ) => {
	const translate = useTranslate();
	const theme = useThemeDetails( slug );
	const isDesktop = useBreakpoint( '>782px' );

	// Check current theme: Does it have a plugin bundled?
	const themeSoftwareSet = theme?.data?.taxonomies?.theme_software_set as
		| ThemeSoftwareSet[]
		| undefined;
	const showBundleVersion = themeSoftwareSet?.length;
	const isExternallyManaged = theme?.data?.theme_type === 'managed-external';

	// Currently, it always get the first software set. In the future, the whole applications can be enhanced to support multiple ones.
	const firstThemeSoftwareSet = themeSoftwareSet?.[ 0 ];
	const bundleSettings = useBundleSettings( firstThemeSoftwareSet?.slug );

	const requiredPlanProduct = useSelect(
		( select ) => select( ProductsList.store ).getProductBySlug( requiredPlan ),
		[ requiredPlan ]
	);

	//Wait until we have theme and product data to show content
	const isLoading = ! requiredPlanProduct || ! theme.data;

	const personalPlanName = getPlan( PLAN_PERSONAL )?.getTitle() || '';
	const premiumPlanName = getPlan( PLAN_PREMIUM )?.getTitle() || '';
	const businessPlanName = getPlan( PLAN_BUSINESS )?.getTitle() || '';
	const ecommercePlanName = getPlan( PLAN_ECOMMERCE )?.getTitle() || '';

	const getPersonalPlanModalData = (): UpgradeModalContent => {
		const planPrice = requiredPlanProduct?.combined_cost_display;

		return {
			header: (
				<h1 className="theme-upgrade-modal__heading">{ translate( 'Unlock this theme' ) }</h1>
			),
			text: (
				<p>
					{ translate(
						'Get access to this theme, and a ton of other features, with a subscription to the %(plan)s plan. It’s {{strong}}%(planPrice)s{{/strong}} a year, risk-free with a 14-day money-back guarantee.',
						{
							components: {
								strong: <strong />,
							},
							args: {
								planPrice: planPrice || '',
								plan: personalPlanName,
							},
						}
					) }
				</p>
			),
			price: null,
			action: (
				<div className="theme-upgrade-modal__actions bundle">
					<Button
						className="theme-upgrade-modal__cancel"
						onClick={ () => closeModal( 'cancel_button' ) }
					>
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

	const getStandardPurchaseModalData = (): UpgradeModalContent => {
		const getPlanText = ( planName: string, term: string, planPrice: string ) => {
			switch ( term ) {
				case 'three years':
					return translate(
						'Get access to this theme, and a ton of other features, with a subscription to the %(planName)s plan. It’s {{strong}}%(planPrice)s{{/strong}} per three years, risk-free with a 14-day money-back guarantee.',
						{
							components: {
								strong: <strong />,
							},
							args: {
								planPrice: planPrice || '',
								planName: planName,
							},
						}
					);
				case 'two years':
					return translate(
						'Get access to this theme, and a ton of other features, with a subscription to the %(planName)s plan. It’s {{strong}}%(planPrice)s{{/strong}} per two years, risk-free with a 14-day money-back guarantee.',
						{
							components: {
								strong: <strong />,
							},
							args: {
								planPrice: planPrice || '',
								planName: planName,
							},
						}
					);
				case 'month':
					return translate(
						'Get access to this theme, and a ton of other features, with a subscription to the %(planName)s plan. It’s {{strong}}%(planPrice)s{{/strong}} per month, risk-free with a 7-day money-back guarantee.',
						{
							components: {
								strong: <strong />,
							},
							args: {
								planPrice: planPrice || '',
								planName: planName,
							},
						}
					);
				case 'year':
				default:
					return translate(
						'Get access to this theme, and a ton of other features, with a subscription to the %(planName)s plan. It’s {{strong}}%(planPrice)s{{/strong}} annually, risk-free with a 14-day money-back guarantee.',
						{
							components: {
								strong: <strong />,
							},
							args: {
								planPrice: planPrice || '',
								planName: planName,
							},
						}
					);
			}
		};
		const planPrice = requiredPlanProduct?.combined_cost_display;

		const planText = getPlanText(
			premiumPlanName as string,
			requiredPlanProduct?.product_term || '',
			planPrice || ''
		);

		return {
			header: (
				<h1 className="theme-upgrade-modal__heading">{ translate( 'Unlock this theme' ) }</h1>
			),
			text: <p>{ planText }</p>,
			price: null,
			action: (
				<div className="theme-upgrade-modal__actions bundle">
					<Button
						className="theme-upgrade-modal__cancel"
						onClick={ () => closeModal( 'cancel_button' ) }
					>
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
		const getPlanText = ( planName: string, term: string, planPrice: string ) => {
			switch ( term ) {
				case 'three years':
					return translate(
						'Upgrade to a %(planName)s plan to select this theme and unlock all its features. It’s %(planPrice)s per three years with a 14-day money-back guarantee',
						{
							args: {
								planPrice: planPrice || '',
								planName: planName,
							},
						}
					);
				case 'two years':
					return translate(
						'Upgrade to a %(planName)s plan to select this theme and unlock all its features. It’s %(planPrice)s per two years with a 14-day money-back guarantee',
						{
							args: {
								planPrice: planPrice || '',
								planName: planName,
							},
						}
					);

				case 'month':
					return translate(
						'Upgrade to a %(planName)s plan to select this theme and unlock all its features. It’s %(planPrice)s per month with a 7-day money-back guarantee',
						{
							args: {
								planPrice: planPrice || '',
								planName: planName,
							},
						}
					);
				case 'year':
				default:
					return translate(
						'Upgrade to a %(planName)s plan to select this theme and unlock all its features. It’s %(planPrice)s per year with a 14-day money-back guarantee',
						{
							args: {
								planPrice: planPrice || '',
								planName: planName,
							},
						}
					);
			}
		};
		const businessPlanPrice = requiredPlanProduct?.combined_cost_display;

		if ( ! bundleSettings ) {
			return {
				header: null,
				text: null,
				price: null,
				action: null,
			};
		}

		const bundleName = bundleSettings.name;
		const bundledPluginMessage = bundleSettings.bundledPluginMessage;
		const color = bundleSettings.color;
		const Icon = bundleSettings.iconComponent;
		const planText = getPlanText(
			businessPlanName as string,
			requiredPlanProduct?.product_term || '',
			businessPlanPrice || ''
		);

		return {
			header: (
				<>
					<div className="theme-upgrade-modal__logo" style={ { backgroundColor: color } }>
						<Icon />
					</div>
					<h1 className="theme-upgrade-modal__heading bundle">
						{
							// Translators: %(bundleName)s is the name of the bundle, sometimes represented as a product name. Examples: "WooCommerce" or "Special".
							translate( 'Unlock this %(bundleName)s theme', { args: { bundleName } } )
						}
					</h1>
				</>
			),
			text: (
				<p>
					{ bundledPluginMessage } { planText }
				</p>
			),
			price: null,
			action: (
				<div className="theme-upgrade-modal__actions bundle">
					<Button
						className="theme-upgrade-modal__cancel"
						onClick={ () => closeModal( 'cancel_button' ) }
					>
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
		const getMarketplacePlanTextByTerm = ( term: string, cost: string ) => {
			switch ( term ) {
				case 'three years':
					return translate( '%(cost)s per three years', { args: { cost } } );
				case 'two years':
					return translate( '%(cost)s per two years', { args: { cost } } );
				case 'month':
					return translate( '%(cost)s per month', { args: { cost } } );
				case 'year':
				default:
					return translate( '%(cost)s per year', { args: { cost } } );
			}
		};

		const productPrice = marketplaceProduct?.cost_display;
		const businessPlanPriceText = getMarketplacePlanTextByTerm(
			requiredPlanProduct?.product_term || '',
			requiredPlanProduct?.combined_cost_display || ''
		);

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
							'This partner theme is only available to buy on the %(businessPlanName)s or %(commercePlanName)s plans.',
							{
								args: {
									businessPlanName: businessPlanName,
									commercePlanName: ecommercePlanName,
								},
							}
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
									<label>
										{ translate( '%(businessPlanName)s plan', {
											args: {
												businessPlanName: businessPlanName,
											},
										} ) }
									</label>
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
					<Button
						className="theme-upgrade-modal__cancel"
						onClick={ () => closeModal( 'cancel_button' ) }
					>
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
			WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
			FEATURE_STYLE_CUSTOMIZATION,
			FEATURE_PRIORITY_24_7_SUPPORT,
			FEATURE_AD_FREE_EXPERIENCE,
			FEATURE_WORDADS,
		] );
	};

	const getPersonalPlanFeatureList = () => {
		return getPlanFeaturesObject( [
			WPCOM_FEATURES_PREMIUM_THEMES_LIMITED,
			FEATURE_STYLE_CUSTOMIZATION,
			FEATURE_CUSTOM_DOMAIN,
			FEATURE_AD_FREE_EXPERIENCE,
			FEATURE_FAST_DNS,
		] );
	};

	const getBundledFirstPartyPurchaseFeatureList = () => {
		return getPlanFeaturesObject( [
			FEATURE_CUSTOM_DOMAIN,
			WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
			FEATURE_STYLE_CUSTOMIZATION,
			FEATURE_PRIORITY_24_7_SUPPORT,
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
			FEATURE_PRIORITY_24_7_SUPPORT,
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
		featureListHeader = translate( 'Included with your %(businessPlanName)s plan', {
			args: { businessPlanName: businessPlanName },
		} );
	} else if ( isExternallyManaged ) {
		modalData = getExternallyManagedPurchaseModalData();
		featureList = getExternallyManagedFeatureList();
		featureListHeader = translate( 'Included with your %(businessPlanName)s plan', {
			args: { businessPlanName: businessPlanName },
		} );
	} else if ( theme?.data?.theme_tier?.feature === WPCOM_FEATURES_PREMIUM_THEMES_LIMITED ) {
		modalData = getPersonalPlanModalData();
		featureList = getPersonalPlanFeatureList();
		featureListHeader = translate( 'Included with your %(plan)s plan', {
			args: { plan: personalPlanName },
		} );
	} else {
		modalData = getStandardPurchaseModalData();
		featureList = getStandardPurchaseFeatureList();
		featureListHeader = translate( 'Included with your %(premiumPlanName)s plan', {
			args: { premiumPlanName: premiumPlanName },
		} );
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
									<WpIcon className="wpicon" icon={ check } size={ 24 } />
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
			additionalClassNames={ additionalClassNames }
			additionalOverlayClassNames={ additionalOverlayClassNames }
			className={ clsx( 'theme-upgrade-modal', { loading: isLoading } ) }
			isVisible={ isOpen }
			onClose={ () => closeModal( 'dialog_action' ) }
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
					<Button
						className="theme-upgrade-modal__close"
						borderless
						onClick={ () => closeModal( 'close_icon' ) }
					>
						<WpIcon className="wpicon" icon={ close } size={ 24 } />
						<ScreenReaderText>{ translate( 'Close modal' ) }</ScreenReaderText>
					</Button>
				</>
			) }
		</Dialog>
	);
};
