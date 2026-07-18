import { siteByIdQuery, sitePluginActiveQuery } from '@automattic/api-queries';
import {
	PLAN_BUSINESS,
	WPCOM_FEATURES_ATOMIC,
	getPlan,
	WPCOM_FEATURES_MANAGE_PLUGINS,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, WordPressLogo } from '@automattic/components';
import { css, Global, ThemeProvider } from '@emotion/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useMemo, useRef } from 'react';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import EmptyContent from 'calypso/components/empty-content';
import { isAtomicTransferredSite } from 'calypso/dashboard/utils/site-atomic-transfers';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useInterval } from 'calypso/lib/interval';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
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
import { getPluginOnSite, getStatusForPlugin } from 'calypso/state/plugins/installed/selectors-ts';
import { PLUGIN_INSTALLATION_ERROR } from 'calypso/state/plugins/installed/status/constants';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin, isFetched } from 'calypso/state/plugins/wporg/selectors';
import {
	isMarketplaceProduct as isMarketplaceProductSelector,
	getProductsList,
} from 'calypso/state/products-list/selectors';
import { getCurrentQueryArguments } from 'calypso/state/selectors/get-current-query-arguments';
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

// The plugin-active endpoint returns 503 for a transient read failure (keep polling) and 502/other
// for a terminal one (stop and surface it).
function isTerminalPluginActiveError( error: unknown ): boolean {
	const status = ( error as { status?: number } | null | undefined )?.status;
	return status != null && status !== 503;
}

// How many times to (re)dispatch activation while the endpoint keeps reporting the plugin inactive
// before treating it as a failed activation. The poll interval spaces the attempts out.
const MAX_ACTIVATION_ATTEMPTS = 3;

const MarketplaceProductInstall = ( {
	pluginSlug = '',
	themeSlug = '',
}: MarketplacePluginInstallProps ) => {
	const isPluginUploadFlow = ! pluginSlug && ! themeSlug;
	const [ currentStep, setCurrentStep ] = useState( 0 );
	// Ref instead of state so the install effect can be guarded synchronously —
	// the dispatch inside the effect notifies redux subscribers (via
	// useSyncExternalStore) before a setState would commit, which would
	// otherwise re-enter the effect and dispatch repeatedly.
	const installFlowInitiatedRef = useRef( false );
	const [ atomicFlow, setAtomicFlow ] = useState( false );
	const [ nonInstallablePlanError, setNonInstallablePlanError ] = useState( false );
	const [ noDirectAccessError, setNoDirectAccessError ] = useState( false );
	const [ userDirectInstallationAllowed, setUserDirectInstallationAllowed ] = useState( false );
	// The signup "Get started" flow reaches this page via a full-page redirect, which drops the
	// in-memory purchase-flow state that normally authorizes the install. When that redirect marks
	// itself as trusted (directInstall), proceed with the install directly instead of waiting on
	// handoff state that will never arrive (which otherwise leaves the page polling forever).
	const directInstallFromSignup = useSelector( getCurrentQueryArguments )?.directInstall != null;
	const directInstallationAllowed = userDirectInstallationAllowed || directInstallFromSignup;
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
	const automatedTransferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, siteId )
	);

	const pluginInstallStatus = useSelector( ( state ) =>
		getStatusForPlugin( state, siteId, pluginSlug )
	);

	// Guards the one activation this page dispatches.
	const activationAttempted = useRef( false );

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

	// A checkout handed this plugin off to this page for installation, whether that install is still
	// in progress or already completed (so it is broader than marketplaceInstallationInProgress).
	const marketplacePluginHandoff = useSelector( ( state ) => {
		const { productSlugInstalled, primaryDomain } = getPurchaseFlowState( state as IAppState );
		return (
			!! pluginSlug && productSlugInstalled === pluginSlug && primaryDomain === selectedSiteSlug
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
	const supportsAtomicUpgrade = useRef< boolean >( undefined );
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
		if ( hasAtomicFeature || isJetpackSelfHosted || nonInstallablePlanError ) {
			return;
		}
		const id = setTimeout( () => {
			if ( ! supportsAtomicUpgrade.current && ! isJetpackSelfHosted ) {
				setNonInstallablePlanError( true );
			}
		}, 2000 );
		return () => clearTimeout( id );
	}, [ hasAtomicFeature, isJetpackSelfHosted, nonInstallablePlanError ] );

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
				if ( shouldShowNoDirectAccessError ) {
					setNoDirectAccessError( true );
				}
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
			! installFlowInitiatedRef.current &&
			( wporgPlugin || wpOrgTheme )
		) {
			installFlowInitiatedRef.current = true;
			const triggerInstallFlow = () => {
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

	// Fetch fresh site data (including admin_url) post-transfer
	const { data: freshSite } = useQuery( {
		...siteByIdQuery( siteId ?? 0 ),
		enabled: !! siteId && ( ! atomicFlow || automatedTransferStatus === transferStates.COMPLETE ),
		refetchInterval: ( query ) =>
			query.state.data && isAtomicTransferredSite( query.state.data ) ? false : 2000,
		staleTime: 0,
		refetchOnMount: 'always',
	} );

	const freshAdminUrl = freshSite?.options?.admin_url;
	const isAtomicTransferReady = freshSite ? isAtomicTransferredSite( freshSite ) : false;
	const pluginsUrlFresh = freshAdminUrl
		? `${ freshAdminUrl }plugins.php?activate=true&plugin_status=active`
		: null;

	const pluginsUrlSelector = useSelector( ( state ) =>
		getSiteAdminUrl( state, siteId, 'plugins.php?activate=true&plugin_status=active' )
	);

	// Prefer fresh URL when available; if in atomic flow, wait for fresh URL
	const pluginsUrlFinal = atomicFlow ? pluginsUrlFresh : pluginsUrlFresh || pluginsUrlSelector;

	const canManagePlugins = useSelector( ( state ) =>
		siteHasFeature( state, selectedSite?.ID, WPCOM_FEATURES_MANAGE_PLUGINS )
	);

	// An install was actually requested through this page — it started one (so the step left 0), or a
	// checkout handed one off — rather than the user simply opening the install URL.
	const installationRequested = currentStep !== 0 || marketplacePluginHandoff;

	// The transferred site is ready for its WP Admin URL and can manage plugins. Stronger than
	// is_wpcom_atomic: isAtomicTransferReady also requires the manage_options capability to have
	// propagated, so we neither activate nor redirect before WP Admin is usable.
	const canReconcilePlugin = isAtomicTransferReady && canManagePlugins;

	// A local install this page started that terminally failed with no plugin to reconcile. Read the
	// current status and action, not the error field the reducer keeps across retries.
	const localInstallFailed =
		installFlowInitiatedRef.current &&
		! installedPlugin &&
		pluginInstallStatus?.status === PLUGIN_INSTALLATION_ERROR &&
		pluginInstallStatus.action === INSTALL_PLUGIN;

	// Activation retries are bounded (below); once exhausted, stop polling and show the failure.
	const [ activationFailed, setActivationFailed ] = useState( false );

	// Poll the read-only active-status endpoint to learn when the plugin is on, for the Atomic
	// wp.org-slug flows. It never installs or activates — the transfer-with-software step does — so
	// this replaces inferring state from the plugin list. The query itself is ephemeral so a stale
	// `complete` from an earlier install can't drive an immediate redirect.
	const shouldPollPluginActive =
		!! pluginSlug &&
		! isPluginUploadFlow &&
		installationRequested &&
		canReconcilePlugin &&
		! localInstallFailed &&
		! activationFailed;

	const {
		data: pluginActiveState,
		error: pluginActiveError,
		dataUpdatedAt: pluginActiveUpdatedAt,
	} = useQuery( {
		...sitePluginActiveQuery( siteId, pluginSlug ),
		enabled: shouldPollPluginActive,
		refetchInterval: ( query ) => {
			// Stop once active or on a terminal read error; keep polling otherwise (incl. a transient 503).
			if (
				query.state.data?.status === 'complete' ||
				isTerminalPluginActiveError( query.state.error )
			) {
				return false;
			}
			return 3000;
		},
		retry: false,
	} );

	const pluginActiveStatus = pluginActiveState?.status;
	const pluginReconcileFailed = isTerminalPluginActiveError( pluginActiveError );

	// `inactive` means installed but not active: dispatch the targeted activation the page always
	// used, with the id the endpoint returns. Each poll that still reports inactive retries it, up to
	// a cap; after that it's a failed activation, not an endless spinner. Keyed on dataUpdatedAt so a
	// fresh inactive result — not just a re-render — drives each retry.
	const activationAttemptsRef = useRef( 0 );
	useEffect( () => {
		const installedId = pluginActiveState?.plugin?.id;
		if ( pluginActiveStatus !== 'inactive' || ! installedId || activationFailed ) {
			return;
		}
		if ( activationAttemptsRef.current >= MAX_ACTIVATION_ATTEMPTS ) {
			setActivationFailed( true );
			return;
		}
		activationAttemptsRef.current += 1;
		setCurrentStep( 2 );
		dispatch( activatePlugin( siteId, { id: installedId, slug: pluginSlug } ) );
	}, [
		pluginActiveUpdatedAt,
		pluginActiveStatus,
		pluginActiveState,
		activationFailed,
		dispatch,
		siteId,
		pluginSlug,
	] );

	// For flows the active-status endpoint can't reach — self-hosted Jetpack sites (not Atomic) and
	// zip uploads (no wp.org slug) — keep the page's existing plugin-list activation: activate the
	// installed plugin once it turns up.
	useEffect( () => {
		if (
			shouldPollPluginActive ||
			currentStep !== 1 ||
			! installedPlugin ||
			installedPlugin.active ||
			activationAttempted.current ||
			( isPluginUploadFlow && ! pluginUploadComplete )
		) {
			return;
		}

		activationAttempted.current = true;
		setCurrentStep( 2 );
		dispatch( activatePlugin( siteId, { id: installedPlugin.id, slug: installedPlugin.slug } ) );
	}, [
		shouldPollPluginActive,
		currentStep,
		installedPlugin,
		isPluginUploadFlow,
		pluginUploadComplete,
		dispatch,
		siteId,
	] );

	// Redirect once the plugin is active, or once a zip-upload transfer completes.
	useEffect( () => {
		const active =
			// The active-status endpoint reports the plugin on (Atomic wp.org flow, readiness already
			// gated by the query being enabled).
			pluginActiveStatus === 'complete' ||
			// Flows the endpoint can't reach: the plugin list reports it active.
			( ! shouldPollPluginActive && installedPlugin?.active );
		const zipUploadTransferred =
			uploadedPluginSlug &&
			isPluginUploadFlow &&
			! isAtomic &&
			transferStates.COMPLETE === automatedTransferStatus &&
			canManagePlugins &&
			isAtomicTransferReady;

		if ( ( ! active && ! zipUploadTransferred ) || ! pluginsUrlFinal ) {
			return;
		}

		// A short delay lets the final progress render before navigating; cancel it if this effect
		// re-runs (e.g. a fresh fetch supersedes a stale result) before it fires.
		let cancelled = false;
		waitFor( 1 ).then( () => {
			if ( ! cancelled ) {
				window.location.href = pluginsUrlFinal as string;
			}
		} );
		return () => {
			cancelled = true;
		};
	}, [
		pluginActiveStatus,
		shouldPollPluginActive,
		installedPlugin,
		automatedTransferStatus,
		isPluginUploadFlow,
		isAtomic,
		canManagePlugins,
		uploadedPluginSlug,
		pluginsUrlFinal,
		isAtomicTransferReady,
	] );

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
						illustration={ wpOrgTheme?.screenshot || null }
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
									<Button primary onClick={ () => setUserDirectInstallationAllowed( true ) }>
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
		// Activation was retried and never took. The plugin is installed, so point at its page to
		// activate it by hand rather than telling the user to re-upload.
		if ( activationFailed ) {
			return (
				<EmptyContent
					title={ null }
					line={ translate( 'We installed the plugin, but could not activate it.' ) }
					action={ translate( 'View plugin' ) }
					actionURL={ `/plugins/${ pluginSlug }/${ selectedSiteSlug }` }
				/>
			);
		}
		// The active-status read failed terminally. The plugin may already be installed or active, so
		// this is not an install failure — point at its page rather than telling the user to re-upload.
		if ( pluginReconcileFailed ) {
			return (
				<EmptyContent
					title={ null }
					line={ translate(
						'We could not verify the plugin’s status. Check it from your plugins.'
					) }
					action={ translate( 'View plugin' ) }
					actionURL={ `/plugins/${ pluginSlug }/${ selectedSiteSlug }` }
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
					title={ null }
					line={ translate(
						'An error occurred while installing the plugin. Please try uploading it again from WP Admin.'
					) }
					secondaryAction={ translate( 'Back' ) }
					secondaryActionURL={
						isPluginUploadFlow
							? `/plugins/upload/${ selectedSiteSlug }`
							: `/plugins/${ pluginSlug }/${ selectedSiteSlug }`
					}
					action={ translate( 'Upload from WP Admin' ) }
					actionURL={ `https://${ selectedSiteSlug }/wp-admin/plugin-install.php?tab=upload` }
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
