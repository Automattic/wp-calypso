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
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { installPluginSimple, activatePlugin } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite, getStatusForPlugin } from 'calypso/state/plugins/installed/selectors';
import { getPlugin } from 'calypso/state/plugins/wporg/selectors';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getPluginUploadProgress from 'calypso/state/selectors/get-plugin-upload-progress';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginActive from 'calypso/state/selectors/is-plugin-active';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const MarketplacePluginInstall = ( { productSlug } ): JSX.Element => {
	const isUploadFlow = ! productSlug;
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
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

	useEffect( () => {
		if ( 100 === pluginUploadProgress ) {
			// For smaller uploads or fast networks give
			// the chance to Upload Plugin step to be shown
			// before moving to next step.
			waitFor( 1 ).then( () => setCurrentStep( 1 ) );
		}
	}, [ pluginUploadProgress, setCurrentStep ] );

	useEffect( () => {
		if ( ! isUploadFlow && currentStep === 0 && wporgPlugin ) {
			// initialize plugin installing
			dispatch( installPluginSimple( siteId, wporgPlugin ) );
			setCurrentStep( 1 );
		}
	}, [ isUploadFlow, currentStep, siteId, wporgPlugin, productSlug ] );

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

	useEffect( () => {
		if ( pluginActive ) {
			waitFor( 1 ).then( () =>
				page( `/marketplace/thank-you/${ installedPlugin?.slug }/${ selectedSiteSlug }` )
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
				{ pluginUploadError || pluginInstallStatus.error ? (
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
