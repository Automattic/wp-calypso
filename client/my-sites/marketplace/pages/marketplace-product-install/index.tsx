import {
	PLAN_BUSINESS,
	WPCOM_FEATURES_ATOMIC,
	getPlan,
	WPCOM_FEATURES_MANAGE_PLUGINS,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { css, Global, ThemeProvider } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useMemo, useRef } from 'react';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import EmptyContent from 'calypso/components/empty-content';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useInterval } from 'calypso/lib/interval';
import { getProductSlugByPeriodVariation } from 'calypso/lib/plugins/utils';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import useMarketplaceAdditionalSteps from 'calypso/my-sites/marketplace/pages/marketplace-product-install/use-marketplace-additional-steps';
import theme from 'calypso/my-sites/marketplace/theme';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { useSelector, useDispatch } from 'calypso/state';
import { initiateAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { getPurchaseFlowState } from 'calypso/state/marketplace/purchase-flow/selectors';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { installPlugin, activatePlugin } from 'calypso/state/plugins/installed/actions';
import {
	getPluginOnSite,
	getStatusForPlugin,
	isPluginActive,
} from 'calypso/state/plugins/installed/selectors-ts';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin, isFetched } from 'calypso/state/plugins/wporg/selectors';
import {
	isMarketplaceProduct as isMarketplaceProductSelector,
	getProductsList,
} from 'calypso/state/products-list/selectors';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getPluginUploadProgress from 'calypso/state/selectors/get-plugin-upload-progress';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite, getSiteAdminUrl } from 'calypso/state/sites/selectors';
import {
	initiateThemeTransfer as initiateTransfer,
	installAndActivateTheme,
	requestActiveTheme,
} from 'calypso/state/themes/actions';
import { getTheme, isThemeActive as getThemeActive } from 'calypso/state/themes/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import './style.scss';
import { MarketplacePluginInstallProps } from './types';
import type { IAppState } from 'calypso/state/types';

const MarketplaceProductInstall = ( {
	pluginSlug = '',
	themeSlug = '',
}: MarketplacePluginInstallProps ) => {
	const isPluginUploadFlow = ! pluginSlug && ! themeSlug;
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ initializeInstallFlow, setInitializeInstallFlow ] = useState( false );
	const [ atomicFlow, setAtomicFlow ] = useState( false );
	const [ nonInstallablePlanError, setNonInstallablePlanError ] = useState( false );
	const [ noDirectAccessError, setNoDirectAccessError ] = useState( false );
	const [ directInstallationAllowed, setDirectInstallationAllowed ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const selectedSite = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId ) as number;
	const pluginUploadProgress = useSelector( ( state ) => getPluginUploadProgress( state, siteId ) );
	const pluginUploadError = useSelector( ( state ) => getPluginUploadError( state, siteId ) );
	const pluginExists = pluginUploadError?.error === 'folder_exists';
	const pluginMalicious = pluginUploadError?.error === 'plugin_malicious';
	const pluginTooBig = pluginUploadError?.statusCode === 413;
	const wporgPlugin = useSelector( ( state ) => getPlugin( state, pluginSlug ) );
	const isWporgPluginFetched = useSelector( ( state ) => isFetched( state, pluginSlug ) );
	const uploadedPluginSlug = useSelector( ( state ) =>
		getUploadedPluginId( state, siteId )
	) as string;
	const pluginUploadComplete = useSelector( ( state ) => isPluginUploadComplete( state, siteId ) );
	const installedPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, siteId, isPluginUploadFlow ? uploadedPluginSlug : pluginSlug )
	);
	const pluginActive = useSelector( ( state ) =>
		isPluginActive( state, siteId, isPluginUploadFlow ? uploadedPluginSlug : pluginSlug )
	);
	const automatedTransferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, siteId )
	);

	const pluginInstallStatus = useSelector( ( state ) =>
		getStatusForPlugin( state, siteId, pluginSlug )
	);

	const productsList = useSelector( getProductsList );
	const isProductListFetched = Object.values( productsList ).length > 0;
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, pluginSlug )
	);

	const wpOrgTheme = useSelector( ( state ) => getTheme( state, 'wporg', themeSlug ) );
	const isThemeActive = useSelector( ( state ) => getThemeActive( state, themeSlug, siteId ) );
	useQueryTheme( 'wporg', themeSlug );

	const { data: wpComPluginData } = useWPCOMPlugin( pluginSlug, {
		enabled: isProductListFetched && isMarketplaceProduct,
	} );

	const marketplaceInstallationInProgress = useSelector( ( state ) => {
		const { pluginInstallationStatus, productSlugInstalled, primaryDomain } = getPurchaseFlowState(
			state as IAppState
		);
		if ( isPluginUploadFlow ) {
			return (
				pluginInstallationStatus !== MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED &&
				primaryDomain === selectedSiteSlug
			);
		}
		return (
			pluginInstallationStatus !== MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED &&
			productSlugInstalled &&
			[ pluginSlug, themeSlug ].includes( productSlugInstalled ) &&
			primaryDomain === selectedSiteSlug
		);
	} );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ?? null ) );
	const isAtomic = useSelector( ( state ) =>
		isSiteAutomatedTransfer( state, selectedSite?.ID ?? null )
	);
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;

	const hasAtomicFeature = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID ?? null, WPCOM_FEATURES_ATOMIC )
	);
	const supportsAtomicUpgrade = useRef< boolean >();
	useEffect( () => {
		supportsAtomicUpgrade.current = hasAtomicFeature;
	}, [ hasAtomicFeature ] );

	// retrieve plugin data if not available
	useEffect( () => {
		if ( ! isWporgPluginFetched ) {
			dispatch( wporgFetchPluginData( pluginSlug ) );
		}
	}, [ isWporgPluginFetched, pluginSlug, dispatch ] );

	// Check if the user plan is enough for installation or it is a self-hosted jetpack site
	// if not, check again in 2s and show an error message
	useEffect( () => {
		if ( ! supportsAtomicUpgrade.current && ! isJetpackSelfHosted ) {
			waitFor( 2 ).then( () => {
				if ( ! supportsAtomicUpgrade.current && ! isJetpackSelfHosted ) {
					setNonInstallablePlanError( true );
				}
			} );
		}
	} );

	const { primaryDomain } = useSelector( getPurchaseFlowState );

	const shouldShowNoDirectAccessError =
		// 1. This is a plugin upload flow (via zip file) and we don't have a primary domain set
		( isPluginUploadFlow && ! primaryDomain ) ||
		// 2. This is a marketplace plugin installation but the installation process hasn't started
		( ! isPluginUploadFlow && ! marketplaceInstallationInProgress );

	// Check that the site URL and the plugin slug are the same which were selected on the plugin page
	useEffect( () => {
		if ( shouldShowNoDirectAccessError ) {
			waitFor( 2 ).then( () => {
				shouldShowNoDirectAccessError && setNoDirectAccessError( true );
			} );
		}
	}, [ shouldShowNoDirectAccessError ] );

	// Upload flow startup
	useEffect( () => {
		if ( 100 === pluginUploadProgress ) {
			// For smaller uploads or fast networks give
			// the chance to Upload Plugin step to be shown
			// before moving to next step.
			waitFor( 1 ).then( () => setCurrentStep( 1 ) );
		}
	}, [ pluginUploadProgress, setCurrentStep ] );

	// Installing plugin flow startup
	useEffect( () => {
		if (
			( marketplaceInstallationInProgress || directInstallationAllowed ) &&
			! isPluginUploadFlow &&
			! initializeInstallFlow &&
			( wporgPlugin || wpOrgTheme )
		) {
			const triggerInstallFlow = () => {
				setInitializeInstallFlow( true );
				waitFor( 1 ).then( () => setCurrentStep( 1 ) );
			};

			if ( isJetpack || isAtomic ) {
				if ( wpOrgTheme ) {
					// initilize theme activating
					dispatch( installAndActivateTheme( wpOrgTheme.id, siteId ) );
				} else {
					// initialize plugin installing
					dispatch( installPlugin( siteId, wporgPlugin, false ) );
				}

				triggerInstallFlow();
			} else if ( hasAtomicFeature ) {
				// initialize atomic flow
				if ( wpOrgTheme ) {
					dispatch( initiateAtomicTransfer( siteId, { themeSlug, context: 'theme_install' } ) );
				} else {
					setAtomicFlow( true );
					dispatch( initiateTransfer( siteId, null, pluginSlug, '', 'plugin_install' ) );
				}

				triggerInstallFlow();
			}
		}
	}, [
		marketplaceInstallationInProgress,
		directInstallationAllowed,
		isPluginUploadFlow,
		initializeInstallFlow,
		siteId,
		wporgPlugin,
		wpOrgTheme,
		pluginSlug,
		themeSlug,
		dispatch,
		hasAtomicFeature,
		isAtomic,
		isJetpack,
	] );

	// Validate completion of atomic transfer flow
	useEffect( () => {
		if ( atomicFlow && currentStep === 1 && transferStates.COMPLETE === automatedTransferStatus ) {
			setCurrentStep( 2 );
		}
	}, [ atomicFlow, automatedTransferStatus, currentStep ] );

	// Validate plugin is already installed and activate
	useEffect( () => {
		if (
			installedPlugin &&
			currentStep === 1 &&
			( ! isPluginUploadFlow || ( isPluginUploadFlow && pluginUploadComplete ) )
		) {
			dispatch(
				activatePlugin( siteId, {
					slug: installedPlugin?.slug,
					id: installedPlugin?.id,
				} )
			);
			setCurrentStep( 2 );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ pluginUploadComplete, installedPlugin, setCurrentStep ] );

	const pluginsUrl = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'plugins.php?activate=true&plugin_status=active' )
	);
	const canManagePlugins = useSelector( ( state ) => {
		return siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS );
	} );
	// Check completition of all flows and redirect to thank you page
	useEffect( () => {
		if (
			// Happens in 3 cases:
			// - Click on "Install and activate" button for any plugin on /plugins/<site_name>
			// - Install with the help of uploading archive of a plugins
			// - If it's simple site which doesn't support plugins, then installing and activation happens at the same time with upgrading to Business plan
			( installedPlugin && pluginActive ) ||
			// Transfer to atomic using a marketplace plugin
			( atomicFlow && transferStates.COMPLETE === automatedTransferStatus && canManagePlugins ) ||
			// Transfer to atomic uploading a zip plugin
			( uploadedPluginSlug &&
				isPluginUploadFlow &&
				! isAtomic &&
				transferStates.COMPLETE === automatedTransferStatus &&
				canManagePlugins )
		) {
			waitFor( 1 ).then( () => {
				window.location.href = pluginsUrl as string;
			} );
		}
	}, [
		pluginActive,
		automatedTransferStatus,
		atomicFlow,
		isPluginUploadFlow,
		isAtomic,
		canManagePlugins,
		installedPlugin,
		uploadedPluginSlug,
		pluginsUrl,
	] ); // We need to trigger this hook also when `automatedTransferStatus` changes cause the plugin install is done on the background in that case.

	// Validate theme is already active
	useEffect( () => {
		if ( themeSlug && wpOrgTheme && isThemeActive ) {
			waitFor( 1 ).then( () =>
				page.redirect(
					`/marketplace/thank-you/${ selectedSiteSlug }?themes=${ themeSlug }&hide-progress-bar`
				)
			);
		}
	}, [ themeSlug, wpOrgTheme, isThemeActive, selectedSiteSlug ] );

	// Polling for theme activation status
	useInterval(
		() => {
			dispatch( requestActiveTheme( siteId ) );
		},
		! themeSlug || currentStep === 0 || ( themeSlug && wpOrgTheme && isThemeActive ) ? null : 3000
	);

	const steps = useMemo( () => {
		if ( themeSlug ) {
			return [ translate( 'Setting up theme installation' ), translate( 'Activating theme' ) ];
		}

		return [
			isPluginUploadFlow
				? translate( 'Uploading plugin' )
				: translate( 'Setting up plugin installation' ),
			translate( 'Installing plugin' ),
			translate( 'Activating plugin' ),
		];
	}, [ themeSlug, isPluginUploadFlow, translate ] );
	const additionalSteps = useMarketplaceAdditionalSteps();

	const renderError = () => {
		// Evaluate error causes in priority order
		if ( nonInstallablePlanError ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ null }
					line={ translate(
						"Your current plan doesn't allow plugin installation. Please upgrade to %(businessPlanName)s plan first.",
						{
							args: { businessPlanName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
						}
					) }
					action={ translate( 'Upgrade to %(planName)s Plan', {
						args: { planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '' },
					} ) }
					actionURL={ `/checkout/${ selectedSite?.slug }/business?redirect_to=/marketplace/plugin/${ pluginSlug }/install/${ selectedSite?.slug }#step2` }
				/>
			);
		}
		if ( isPluginUploadFlow && noDirectAccessError && ! directInstallationAllowed ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ null }
					line={ translate(
						'This URL should not be accessed directly. Please try to upload the plugin again.'
					) }
					action={ translate( 'Go to the upload page' ) }
					actionURL={ `/plugins/upload/${ selectedSite?.slug }` }
				/>
			);
		}

		if ( themeSlug && noDirectAccessError && ! directInstallationAllowed ) {
			const variationPeriod = 'monthly';
			const variation = wpComPluginData?.variations?.[ variationPeriod ];
			const marketplaceProductSlug = getProductSlugByPeriodVariation( variation, productsList );
			const productPage = `/themes/${ themeSlug }/${ selectedSite?.slug }`;
			const productName = wpOrgTheme?.name || themeSlug;

			return (
				<>
					<QueryProductsList />
					<EmptyContent
						className="marketplace-plugin-install__direct-install-container"
						illustration={ wpOrgTheme?.screenshot || '/calypso/images/illustrations/error.svg' }
						illustrationWidth={ wpOrgTheme?.screenshot && 720 }
						title={ productName }
						line={ translate( 'Do you want to activate the theme %(theme)s?', {
							args: { theme: wpOrgTheme?.name },
						} ) }
					>
						{ isProductListFetched && (
							<div className="marketplace-plugin-install__direct-install-actions">
								<Button href={ productPage }>{ translate( 'Go to the theme page' ) }</Button>

								{ ! isMarketplaceProduct ? (
									<Button primary onClick={ () => setDirectInstallationAllowed( true ) }>
										{ translate( 'Activate theme' ) }
									</Button>
								) : (
									<Button
										primary
										onClick={ () =>
											page(
												`/checkout/${ selectedSite?.slug || '' }/${ marketplaceProductSlug }?#step2`
											)
										}
									>
										{ translate( 'Purchase and activate plugin' ) }
									</Button>
								) }
							</div>
						) }
					</EmptyContent>
				</>
			);
		}
		if ( pluginExists ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ null }
					line={ translate(
						'This plugin already exists on your site. If you want to upgrade or downgrade the plugin, please continue by uploading the plugin again from WP Admin.'
					) }
					secondaryAction={ translate( 'Back' ) }
					secondaryActionURL={ `/plugins/upload/${ selectedSiteSlug }` }
					action={ translate( 'Re-upload plugin' ) }
					actionURL={ `https://${ selectedSiteSlug }/wp-admin/plugin-install.php?tab=upload` }
				/>
			);
		}
		if ( pluginMalicious || pluginTooBig ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ null }
					line={
						pluginMalicious
							? translate(
									'This plugin is identified as malicious. If you still insist to install the plugin, please continue by uploading the plugin again from WP Admin.'
							  )
							: translate(
									'This plugin is too big to be installed via this page. If you still want to install the plugin, please continue by uploading the plugin again from WP Admin.'
							  )
					}
					secondaryAction={ translate( 'Back' ) }
					secondaryActionURL={ `/plugins/upload/${ selectedSiteSlug }` }
					action={ translate( 'Re-upload plugin' ) }
					actionURL={ `https://${ selectedSiteSlug }/wp-admin/plugin-install.php?tab=upload` }
				/>
			);
		}
		// Catch the rest of the error cases.
		if (
			pluginUploadError ||
			pluginInstallStatus?.error ||
			( atomicFlow && automatedTransferStatus === transferStates.FAILURE )
		) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ null }
					line={ translate( 'An error occurred while installing the plugin.' ) }
					action={ translate( 'Back' ) }
					actionURL={
						isPluginUploadFlow
							? `/plugins/upload/${ selectedSiteSlug }`
							: `/plugins/${ pluginSlug }/${ selectedSiteSlug }`
					}
				/>
			);
		}
	};

	return (
		<ThemeProvider theme={ theme }>
			<PageViewTracker
				path="/marketplace/(plugin/theme)/:productSlug?/install/:site?"
				title="Marketplace Product > Installing"
			/>
			<QueryActiveTheme siteId={ siteId } />
			{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
			<Masterbar className="marketplace-plugin-install__masterbar">
				<Global
					styles={ css`
						body {
							--masterbar-height: 72px;
						}
					` }
				/>
				<WordPressLogo className="marketplace-plugin-install__logo" size={ 24 } />
			</Masterbar>
			<div className="marketplace-plugin-install__root">
				{ renderError() || (
					<MarketplaceProgressBar
						steps={ steps }
						currentStep={ currentStep }
						additionalSteps={ additionalSteps }
					/>
				) }
			</div>
		</ThemeProvider>
	);
};

export default MarketplaceProductInstall;
