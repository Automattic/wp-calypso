import { ThemeProvider } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getPluginUploadProgress from 'calypso/state/selectors/get-plugin-upload-progress';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isLoaded, isRequestingForSites } from 'calypso/state/plugins/installed/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const MarketplacePluginUpload = (): JSX.Element => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isPluginStateLoaded = useSelector( ( state ) => isLoaded( state, [ selectedSiteId ] ) );
	const isPluginStateFetching = useSelector( ( state ) =>
		isRequestingForSites( state, [ selectedSiteId ] )
	);
	const pluginUploadProgress = useSelector( ( state ) =>
		getPluginUploadProgress( state, [ selectedSiteId ] )
	);
	const pluginUploadError = useSelector( ( state ) =>
		getPluginUploadError( state, [ selectedSiteId ] )
	);
	const uploadedPluginId = useSelector( ( state ) =>
		getUploadedPluginId( state, [ selectedSiteId ] )
	);
	const pluginUploadComplete = useSelector( ( state ) =>
		isPluginUploadComplete( state, [ selectedSiteId ] )
	);

	useEffect( () => {
		if ( pluginUploadError ) {
			page( `/plugins/upload/${ selectedSiteSlug }` );
			return;
		}
	}, [ pluginUploadError ] );

	useEffect( () => {}, [] );

	const steps = [
		translate( 'Uploading plugin' ),
		translate( 'Installing plugin' ),
		translate( 'Activating plugin' ),
	];
	return (
		<ThemeProvider theme={ theme }>
			<PageViewTracker path="/marketplace/product/install/:site" title="Plugins > Installing" />
			{ selectedSiteId ? <QueryJetpackPlugins siteIds={ [ selectedSiteId ] } /> : '' }
			<Masterbar></Masterbar>
			<div className="marketplace-plugin-upload-status__root">
				<MarketplaceProgressBar steps={ steps } currentStep={ 1 } accelerateCompletion={ true } />
			</div>
		</ThemeProvider>
	);
};

export default MarketplacePluginUpload;
