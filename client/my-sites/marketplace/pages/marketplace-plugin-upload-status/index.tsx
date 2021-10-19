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
import { togglePluginActivation } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import getPluginUploadError from 'calypso/state/selectors/get-plugin-upload-error';
import getPluginUploadProgress from 'calypso/state/selectors/get-plugin-upload-progress';
import getUploadedPluginId from 'calypso/state/selectors/get-uploaded-plugin-id';
import isPluginActive from 'calypso/state/selectors/is-plugin-active';
import isPluginUploadComplete from 'calypso/state/selectors/is-plugin-upload-complete';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

const MarketplacePluginUpload = (): JSX.Element => {
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId ) as number;
	const pluginUploadProgress = useSelector( ( state ) => getPluginUploadProgress( state, siteId ) );
	const pluginUploadError = useSelector( ( state ) => getPluginUploadError( state, siteId ) );
	const uploadedPluginSlug = useSelector( ( state ) =>
		getUploadedPluginId( state, siteId )
	) as string;
	const pluginUploadComplete = useSelector( ( state ) => isPluginUploadComplete( state, siteId ) );
	const uploadedPlugin = useSelector( ( state ) =>
		getPluginOnSite( state, siteId, uploadedPluginSlug )
	);

	const pluginActive = useSelector( ( state ) =>
		isPluginActive( state, siteId, uploadedPluginSlug )
	);

	useEffect( () => {
		if ( 100 === pluginUploadProgress ) {
			// For smaller uploads or fast networks give
			// the chance to Upload Plugin step to be shown
			// before moving to next step.
			waitFor( 1 ).then( () => setCurrentStep( 1 ) );
		}
	}, [ pluginUploadProgress ] );

	useEffect( () => {
		if ( pluginUploadComplete && uploadedPlugin ) {
			dispatch(
				togglePluginActivation( siteId, {
					slug: uploadedPlugin?.slug,
					id: uploadedPlugin?.id,
				} )
			);
			setCurrentStep( 2 );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ pluginUploadComplete, uploadedPlugin ] );

	useEffect( () => {
		if ( pluginActive ) {
			waitFor( 1 ).then( () =>
				page( `/marketplace/thank-you/${ uploadedPlugin?.slug }/${ selectedSiteSlug }` )
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ pluginActive ] );

	const steps = [
		translate( 'Uploading plugin' ),
		translate( 'Installing plugin' ),
		translate( 'Activating plugin' ),
	];

	return (
		<ThemeProvider theme={ theme }>
			<PageViewTracker path="/marketplace/product/install/:site" title="Plugins > Installing" />
			{ siteId ? <QueryJetpackPlugins siteIds={ [ siteId ] } /> : '' }
			<Masterbar>
				<Item>{ translate( 'Plugin Installation' ) }</Item>
			</Masterbar>
			<div className="marketplace-plugin-upload-status__root">
				{ pluginUploadError ? (
					<EmptyContent
						illustration="/calypso/images/illustrations/error.svg"
						title={ translate( 'An error occurred while installing the plugin.' ) }
						action={ translate( 'Back' ) }
						actionURL={ `/plugins/upload/${ selectedSiteSlug }` }
					/>
				) : (
					<MarketplaceProgressBar steps={ steps } currentStep={ currentStep } />
				) }
			</div>
		</ThemeProvider>
	);
};

export default MarketplacePluginUpload;
