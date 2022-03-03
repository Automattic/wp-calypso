import page from 'page';
import { useDispatch, useSelector } from 'react-redux';
import Spotlight from 'calypso/components/spotlight';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getPlugins, isRequesting } from 'calypso/state/plugins/installed/selectors';
import { siteObjectsToSiteIds } from '../utils';

const PluginSpotlight = ( { eligiblePlugins, site, currentSites } ) => {
	const sitePlugins = useSelector( ( state ) =>
		getPlugins( state, siteObjectsToSiteIds( currentSites ) )
	);

	const isFetchingInstalledPlugins = useSelector( ( state ) =>
		isRequesting( state, currentSites[ 0 ].ID )
	);

	const selectedPlugin =
		currentSites.length === 1
			? eligiblePlugins.find( ( eligiblePlugin ) => {
					const pluginFound = !! sitePlugins.find(
						( sitePlugin ) => sitePlugin.slug === eligiblePlugin.slug
					);
					return ! pluginFound;
			  } )
			: eligiblePlugins[ 0 ];

	const {
		data: spotlightPlugin,
		isFetched: spotlightPluginFetched,
	} = useWPCOMPlugin( selectedPlugin?.slug, { enabled: !! selectedPlugin } );
	const dispatch = useDispatch();

	if ( ! spotlightPluginFetched || isFetchingInstalledPlugins ) {
		return <></>;
	}

	const spotlightOnClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_marketplace_spotlight_click', {
				type: 'plugin',
				slug: spotlightPlugin.slug,
				id: spotlightPlugin.id,
				site: site,
			} )
		);
		page( `/plugins/${ spotlightPlugin.slug }/${ site || '' }` );
	};

	return (
		<>
			{ spotlightPlugin && (
				<Spotlight
					onClick={ spotlightOnClick }
					taglineText={ selectedPlugin.tagline }
					titleText={ selectedPlugin.title }
					ctaText={ selectedPlugin.cta }
					illustrationSrc={ spotlightPlugin?.icon ?? '' }
				/>
			) }
		</>
	);
};

export default PluginSpotlight;
