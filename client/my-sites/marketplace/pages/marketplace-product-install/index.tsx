import { WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import { WordPressWordmark, Button } from '@automattic/components';
import { ThemeProvider } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch, DefaultRootState } from 'react-redux';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import EmptyContent from 'calypso/components/empty-content';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useInterval } from 'calypso/lib/interval';
import { getProductSlugByPeriodVariation } from 'calypso/lib/plugins/utils';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import useMarketplaceAdditionalSteps from 'calypso/my-sites/marketplace/pages/marketplace-product-install/use-marketplace-additional-steps';
import theme from 'calypso/my-sites/marketplace/theme';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { initiateAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { getPurchaseFlowState } from 'calypso/state/marketplace/purchase-flow/selectors';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { installPlugin, activatePlugin } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite, getStatusForPlugin } from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin, isFetched } from 'calypso/state/plugins/wporg/selectors';
import {
	isMarketplaceProduct as isMarketplaceProductSelector,
	getProductsList,
} from 'calypso/state/products-list/selectors';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getPluginUploadProgress from 'calypso/state/selectors/get-plugin-upload-progress';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginActive from 'calypso/state/selectors/is-plugin-active';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import {
	activateTheme,
	initiateThemeTransfer as initiateTransfer,
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

interface InstalledPlugin {
	slug?: string;
	id?: number;
}

const MarketplaceProductInstall = ( {
	productSlug = '',
	themeSlug = '',
}: MarketplacePluginInstallProps ) => {
	const isUploadFlow = ! productSlug && ! themeSlug;
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
	const wporgPlugin = useSelector( ( state ) => getPlugin( state, productSlug ) );
	const isWporgPluginFetched = useSelector( ( state ) => isFetched( state, productSlug ) );
	const uploadedPluginSlug = useSelector( ( state ) =>
		getUploadedPluginId( state, siteId )
	) as string;
	const pluginUploadComplete = useSelector( ( state ) => isPluginUploadComplete( state, siteId ) );
	const installedPlugin = useSelector( ( state: DefaultRootState ): InstalledPlugin | undefined =>
		getPluginOnSite( state, siteId, isUploadFlow ? uploadedPluginSlug : productSlug )
	);
	const pluginActive = useSelector( ( state ) =>
		isPluginActive( state, siteId, isUploadFlow ? uploadedPluginSlug : productSlug )
	);
	const automatedTransferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, siteId )
	);

	const pluginInstallStatus = useSelector( ( state ) =>
		getStatusForPlugin( state, siteId, productSlug )
	);

	const productsList = useSelector( ( state ) => getProductsList( state ) );
	const isProductListFetched = Object.values( productsList ).length > 0;
	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, productSlug )
	);

	const wpOrgTheme = useSelector( ( state ) => getTheme( state, 'wporg', themeSlug ) );
	const isThemeActive = useSelector( ( state ) => getThemeActive( state, themeSlug, siteId ) );
	useQueryTheme( 'wporg', themeSlug );

	const { data: wpComPluginData } = useWPCOMPlugin( productSlug, {
		enabled: isProductListFetched && isMarketplaceProduct,
	} );

	const marketplaceInstallationInProgress = useSelector( ( state ) => {
		const { pluginInstallationStatus, productSlugInstalled, primaryDomain } = getPurchaseFlowState(
			state as IAppState
		);
		if ( isUploadFlow ) {
			return (
				pluginInstallationStatus !== MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED &&
				primaryDomain === selectedSiteSlug
			);
		}
		return (
			pluginInstallationStatus !== MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED &&
			productSlugInstalled &&
			[ productSlug, themeSlug ].includes( productSlugInstalled ) &&
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
			dispatch( wporgFetchPluginData( productSlug ) );
		}
	}, [ isWporgPluginFetched, productSlug, dispatch ] );

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

	// Check that the site URL and the plugin slug are the same which were selected on the plugin page
	useEffect( () => {
		if ( ! marketplaceInstallationInProgress ) {
			waitFor( 2 ).then( () => {
				! marketplaceInstallationInProgress && setNoDirectAccessError( true );
			} );
		}
	}, [ marketplaceInstallationInProgress ] );

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
			! isUploadFlow &&
			! initializeInstallFlow &&
			( wporgPlugin || wpOrgTheme ) &&
			selectedSite
		) {
			const triggerInstallFlow = () => {
				setInitializeInstallFlow( true );
				waitFor( 1 ).then( () => setCurrentStep( 1 ) );
			};

			if ( selectedSite.jetpack ) {
				if ( wpOrgTheme ) {
					// initilize theme activating
					dispatch( activateTheme( wpOrgTheme.id, siteId ) );
				} else {
					// initialize plugin installing
					dispatch( installPlugin( siteId, wporgPlugin, false ) );
				}

				triggerInstallFlow();
			} else if ( hasAtomicFeature ) {
				// initialize atomic flow
				if ( wpOrgTheme ) {
					dispatch( initiateAtomicTransfer( siteId, { themeSlug } ) );
				} else {
					setAtomicFlow( true );
					dispatch( initiateTransfer( siteId, null, productSlug ) );
				}

				triggerInstallFlow();
			}
		}
	}, [
		marketplaceInstallationInProgress,
		directInstallationAllowed,
		isUploadFlow,
		initializeInstallFlow,
		selectedSite,
		siteId,
		wporgPlugin,
		wpOrgTheme,
		productSlug,
		themeSlug,
		dispatch,
		hasAtomicFeature,
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
			( ! isUploadFlow || ( isUploadFlow && pluginUploadComplete ) )
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

	// Check completition of all flows and redirect to thank you page
	useEffect( () => {
		if (
			// Default process
			( installedPlugin && pluginActive ) ||
			// Transfer to atomic using a marketplace plugin
			( atomicFlow && transferStates.COMPLETE === automatedTransferStatus ) ||
			// Transfer to atomic uploading a zip plugin
			( uploadedPluginSlug &&
				isUploadFlow &&
				! isAtomic &&
				transferStates.COMPLETE === automatedTransferStatus )
		) {
			waitFor( 1 ).then( () =>
				page.redirect(
					`/marketplace/thank-you/${ selectedSiteSlug }?hide-progress-bar&plugins=${
						installedPlugin?.slug || productSlug || uploadedPluginSlug
					}`
				)
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ pluginActive, automatedTransferStatus, atomicFlow, isUploadFlow, isAtomic ] ); // We need to trigger this hook also when `automatedTransferStatus` changes cause the plugin install is done on the background in that case.

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
			isUploadFlow
				? translate( 'Uploading plugin' )
				: translate( 'Setting up plugin installation' ),
			translate( 'Installing plugin' ),
			translate( 'Activating plugin' ),
		];
	}, [ themeSlug, isUploadFlow, translate ] );
	const additionalSteps = useMarketplaceAdditionalSteps();

	const installPluginQuestionText = translate( 'Do you want to install the plugin %(plugin)s?', {
		args: { plugin: wporgPlugin?.name || wpComPluginData?.name },
	} );
	const activateThemeQuestionText = translate( 'Do you want to activate the theme %(theme)s?', {
		args: { theme: wpOrgTheme?.name },
	} );
	const questionText = themeSlug ? activateThemeQuestionText : installPluginQuestionText;

	const illustration = themeSlug
		? wpOrgTheme?.screenshot
		: wporgPlugin?.icon || wpComPluginData?.icon;
	const pluginIllustrationWidth = 128;
	const themeIllustrationWidth = 720;
	const illustrationWidth = themeSlug ? themeIllustrationWidth : pluginIllustrationWidth;

	const productName = themeSlug
		? wpOrgTheme?.name || themeSlug
		: wporgPlugin?.name || wpComPluginData?.name || productSlug;

	const productPage = themeSlug
		? `/themes/${ themeSlug }/${ selectedSite?.slug }`
		: `/plugins/${ productSlug }/${ selectedSite?.slug }`;
	const goToPluginPageText = translate( 'Go to the plugin page' );
	const goToThemePageText = translate( 'Go to the theme page' );
	const goToText = themeSlug ? goToThemePageText : goToPluginPageText;

	const installPluginText = translate( 'Install and activate plugin' );
	const activateThemeText = translate( 'Activate theme' );
	const CTAText = themeSlug ? activateThemeText : installPluginText;

	const renderError = () => {
		// Evaluate error causes in priority order
		if ( nonInstallablePlanError ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ null }
					line={ translate(
						"Your current plan doesn't allow plugin installation. Please upgrade to Business plan first."
					) }
					action={ translate( 'Upgrade to Business Plan' ) }
					actionURL={ `/checkout/${ selectedSite?.slug }/business?redirect_to=/marketplace/plugin/${ productSlug }/install/${ selectedSite?.slug }#step2` }
				/>
			);
		}
		if ( isUploadFlow && noDirectAccessError && ! directInstallationAllowed ) {
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
		if ( noDirectAccessError && ! directInstallationAllowed ) {
			const variationPeriod = 'monthly';
			const variation = wpComPluginData?.variations?.[ variationPeriod ];
			const marketplaceProductSlug = getProductSlugByPeriodVariation( variation, productsList );

			return (
				<>
					<QueryProductsList />
					<EmptyContent
						className="marketplace-plugin-install__direct-install-container"
						illustration={ illustration || '/calypso/images/illustrations/error.svg' }
						illustrationWidth={
							( wporgPlugin?.icon || wpComPluginData?.icon || wpOrgTheme?.screenshot ) &&
							illustrationWidth
						}
						title={ productName }
						line={ questionText }
					>
						{ isProductListFetched && (
							<div className="marketplace-plugin-install__direct-install-actions">
								<Button href={ productPage }>{ goToText }</Button>

								{ ! isMarketplaceProduct ? (
									<Button primary onClick={ () => setDirectInstallationAllowed( true ) }>
										{ CTAText }
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
					action={ translate( 'Continue' ) }
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
					action={ translate( 'Continue' ) }
					actionURL={ `https://${ selectedSiteSlug }/wp-admin/plugin-install.php?tab=upload` }
				/>
			);
		}
		// Catch the rest of the error cases.
		if (
			pluginUploadError ||
			pluginInstallStatus.error ||
			( atomicFlow && automatedTransferStatus === transferStates.FAILURE )
		) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ null }
					line={ translate( 'An error occurred while installing the plugin.' ) }
					action={ translate( 'Back' ) }
					actionURL={
						isUploadFlow
							? `/plugins/upload/${ selectedSiteSlug }`
							: `/plugins/${ productSlug }/${ selectedSiteSlug }`
					}
				/>
			);
		}
	};

	return (
		<ThemeProvider theme={ theme }>
			<PageViewTracker
				path="/marketplace/:productSlug?/install/:site?"
				title="Plugins > Installing"
			/>
			<QueryActiveTheme siteId={ siteId } />
			{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
			<Masterbar className="marketplace-plugin-install__masterbar">
				<WordPressWordmark className="marketplace-plugin-install__wpcom-wordmark" />
				<Item>{ translate( 'Plugin installation' ) }</Item>
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
