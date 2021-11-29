import { isBusiness, isEcommerce, isEnterprise } from '@automattic/calypso-products';
import { ThemeProvider } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import EmptyContent from 'calypso/components/empty-content';
import WordPressWordmark from 'calypso/components/wordpress-wordmark';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { getPurchaseFlowState } from 'calypso/state/marketplace/purchase-flow/selectors';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { installPlugin, activatePlugin } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite, getStatusForPlugin } from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin, isFetched } from 'calypso/state/plugins/wporg/selectors';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getPluginUploadProgress from 'calypso/state/selectors/get-plugin-upload-progress';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginActive from 'calypso/state/selectors/is-plugin-active';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { initiateThemeTransfer as initiateTransfer } from 'calypso/state/themes/actions';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import './style.scss';
import { MarketplacePluginInstallProps } from './types';

const MarketplacePluginInstall = ( {
	productSlug,
}: MarketplacePluginInstallProps ): JSX.Element => {
	const isUploadFlow = ! productSlug;
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ initializeInstallFlow, setInitializeInstallFlow ] = useState( false );
	const [ atomicFlow, setAtomicFlow ] = useState( false );
	const [ nonInstallablePlanError, setNonInstallablePlanError ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const selectedSite = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId ) as number;
	const pluginUploadProgress = useSelector( ( state ) => getPluginUploadProgress( state, siteId ) );
	const pluginUploadError = useSelector( ( state ) => getPluginUploadError( state, siteId ) );
	const wporgPlugin = useSelector( ( state ) => getPlugin( state, productSlug ) );
	const isWporgPluginFetched = useSelector( ( state ) => isFetched( state, productSlug ) );
	const uploadedPluginSlug = useSelector( ( state ) =>
		getUploadedPluginId( state, siteId )
	) as string;
	const pluginUploadComplete = useSelector( ( state ) => isPluginUploadComplete( state, siteId ) );
	const installedPlugin = useSelector( ( state ) =>
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

	const marketplacePluginInstallationInProgress = useSelector( ( state ) => {
		const { pluginInstallationStatus, productSlugInstalled, primaryDomain } = getPurchaseFlowState(
			state
		);
		return (
			pluginInstallationStatus === MARKETPLACE_ASYNC_PROCESS_STATUS.IN_PROGRESS &&
			productSlugInstalled === productSlug &&
			primaryDomain === selectedSiteSlug
		);
	} );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ?? null ) );
	const isAtomic = useSelector( ( state ) =>
		isSiteAutomatedTransfer( state, selectedSite?.ID ?? null )
	);
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;

	const supportsAtomicUpgrade = useRef< boolean >();
	useEffect( () => {
		supportsAtomicUpgrade.current =
			selectedSite?.plan &&
			( isBusiness( selectedSite.plan ) ||
				isEnterprise( selectedSite.plan ) ||
				isEcommerce( selectedSite.plan ) );
	}, [ selectedSite ] );

	// retrieve plugin data if not available
	useEffect( () => {
		if ( ! isWporgPluginFetched ) {
			dispatch( wporgFetchPluginData( productSlug ) );
		}
	}, [ isWporgPluginFetched, productSlug ] );

	// Check if the user plan is enough for installation or it is a self-hosted jetpack site
	// if not, check again in 2s and show an error message
	useEffect( () => {
		if ( ! supportsAtomicUpgrade.current && ! isJetpackSelfHosted ) {
			waitFor( 2 ).then(
				() =>
					! supportsAtomicUpgrade.current &&
					! isJetpackSelfHosted &&
					setNonInstallablePlanError( true )
			);
		}
	} );

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
			marketplacePluginInstallationInProgress &&
			! isUploadFlow &&
			! initializeInstallFlow &&
			wporgPlugin &&
			selectedSite
		) {
			const triggerInstallFlow = () => {
				setInitializeInstallFlow( true );
				waitFor( 1 ).then( () => setCurrentStep( 1 ) );
			};

			if ( selectedSite.jetpack ) {
				// initialize plugin installing
				dispatch( installPlugin( siteId, wporgPlugin, false ) );

				triggerInstallFlow();
			} else if ( supportsAtomicUpgrade.current ) {
				// initialize atomic flow
				setAtomicFlow( true );
				dispatch( initiateTransfer( siteId, null, productSlug ) );

				triggerInstallFlow();
			}
		}
	}, [
		marketplacePluginInstallationInProgress,
		isUploadFlow,
		initializeInstallFlow,
		selectedSite,
		siteId,
		wporgPlugin,
		productSlug,
	] );

	// Validate completition of atomic transfer flow
	useEffect( () => {
		if ( atomicFlow && currentStep === 1 && transferStates.COMPLETE === automatedTransferStatus ) {
			setCurrentStep( 2 );
		}
	}, [ atomicFlow, automatedTransferStatus ] );

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
			( installedPlugin && pluginActive ) ||
			( atomicFlow && transferStates.COMPLETE === automatedTransferStatus )
		) {
			waitFor( 1 ).then( () =>
				page.redirect(
					`/marketplace/thank-you/${ installedPlugin?.slug || productSlug }/${ selectedSiteSlug }`
				)
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ pluginActive, automatedTransferStatus ] ); // We need to trigger this hook also when `automatedTransferStatus` changes cause the plugin install is done on the background in that case.

	const steps = [
		isUploadFlow ? translate( 'Uploading plugin' ) : translate( 'Setting up plugin installation' ),
		translate( 'Installing plugin' ),
		translate( 'Activating plugin' ),
	];

	const renderError = () => {
		if ( ! marketplacePluginInstallationInProgress ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ translate(
						'This URL should not be accessed directly. Please click the Install button on the plugin page.'
					) }
					action={ translate( 'Go to the plugin page' ) }
					actionURL={ `/plugins/${ productSlug }/${ selectedSite?.slug }` }
				/>
			);
		}
		if ( nonInstallablePlanError ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ translate(
						"Your current plan doesn't allow plugin installation. Please upgrade to Business plan first."
					) }
					action={ translate( 'Upgrade to Business Plan' ) }
					actionURL={ `/checkout/${ selectedSite?.slug }/business?redirect_to=/marketplace/${ productSlug }/install/${ selectedSite?.slug }#step2` }
				/>
			);
		}
		if (
			pluginUploadError ||
			pluginInstallStatus.error ||
			( atomicFlow && automatedTransferStatus === transferStates.FAILURE )
		) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ translate( 'An error occurred while installing the plugin.' ) }
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
			{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
			<Masterbar>
				<WordPressWordmark className="marketplace-plugin-upload-status__wpcom-wordmark" />
				<Item>{ translate( 'Plugin Installation' ) }</Item>
			</Masterbar>
			<div className="marketplace-plugin-upload-status__root">
				{ renderError() || <MarketplaceProgressBar steps={ steps } currentStep={ currentStep } /> }
			</div>
		</ThemeProvider>
	);
};

export default MarketplacePluginInstall;
