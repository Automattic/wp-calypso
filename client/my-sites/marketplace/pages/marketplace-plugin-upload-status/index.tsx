// import { isBusiness, isEcommerce, isEnterprise } from '@automattic/calypso-products';
import { ThemeProvider } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import EmptyContent from 'calypso/components/empty-content';
import Item from 'calypso/layout/masterbar/item';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { installPlugin, activatePlugin } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite, getStatusForPlugin } from 'calypso/state/plugins/installed/selectors';
import { getPlugin } from 'calypso/state/plugins/wporg/selectors';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getPluginUploadProgress from 'calypso/state/selectors/get-plugin-upload-progress';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginActive from 'calypso/state/selectors/is-plugin-active';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import { initiateThemeTransfer as initiateTransfer } from 'calypso/state/themes/actions';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import './style.scss';

const MarketplacePluginInstall = ( { productSlug } ): JSX.Element => {
	const isUploadFlow = ! productSlug;
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ initializeInstallFlow, setInitializeInstallFlow ] = useState( false );
	const [ moveToAtomicFlow, setMoveToAtomicFlow ] = useState( false );
	const [ atomicError ] = useState( false );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const selectedSite = useSelector( getSelectedSite );
	const siteId = useSelector( getSelectedSiteId ) as number;
	const pluginUploadProgress = useSelector( ( state ) => getPluginUploadProgress( state, siteId ) );
	const pluginUploadError = useSelector( ( state ) => getPluginUploadError( state, siteId ) );
	const wporgPlugin = useSelector( ( state ) => getPlugin( state, productSlug ) );
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
		if ( ! isUploadFlow && ! initializeInstallFlow && wporgPlugin && selectedSite ) {
			// const upgradablePlan = isBusiness( selectedSite.plan ) || isEnterprise( selectedSite.plan ) || isEcommerce( selectedSite.plan );

			if ( selectedSite?.jetpack ) {
				// initialize plugin installing
				dispatch( installPlugin( siteId, wporgPlugin, false ) );
			} else {
				// initialize atomic flow
				setMoveToAtomicFlow( true );
				dispatch( initiateTransfer( siteId, null, productSlug ) );
			}

			setInitializeInstallFlow( true );
			waitFor( 1 ).then( () => setCurrentStep( 1 ) );
		}
	}, [ isUploadFlow, siteId, wporgPlugin, productSlug ] );

	// Validate completition of atomic transfer flow
	useEffect( () => {
		if (
			moveToAtomicFlow &&
			currentStep === 1 &&
			transferStates.COMPLETE === automatedTransferStatus
		) {
			setCurrentStep( 2 );
		}
	}, [ moveToAtomicFlow, automatedTransferStatus ] );

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
			( moveToAtomicFlow && transferStates.COMPLETE === automatedTransferStatus )
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

	return (
		<ThemeProvider theme={ theme }>
			<PageViewTracker path="/marketplace/product/install/:site" title="Plugins > Installing" />
			{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
			<Masterbar>
				<Item>{ translate( 'Plugin Installation' ) }</Item>
			</Masterbar>
			<div className="marketplace-plugin-upload-status__root">
				{ pluginUploadError ||
				pluginInstallStatus.error ||
				atomicError ||
				automatedTransferStatus === transferStates.FAILURE ? (
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
				) : (
					<MarketplaceProgressBar steps={ steps } currentStep={ currentStep } />
				) }
			</div>
		</ThemeProvider>
	);
};

export default MarketplacePluginInstall;
