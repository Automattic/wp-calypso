import page from 'page';
import { useDispatch, useSelector } from 'react-redux';
import Spotlight from 'calypso/components/spotlight';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getPlugins, isRequesting } from 'calypso/state/plugins/installed/selectors';
import { siteObjectsToSiteIds } from '../utils';

export interface EligiblePlugins {
	slug: string;
	title: string;
	tagline: string;
	cta: string;
}

export interface PluginSpotlightProps {
	eligiblePlugins: EligiblePlugins[];
	site: string;
	currentSites: any[];
}

const PluginSpotlight = ( { eligiblePlugins, site, currentSites }: PluginSpotlightProps ) => {
	const dispatch = useDispatch();
	const sitePlugins = useSelector( ( state ) =>
		getPlugins( state, siteObjectsToSiteIds( currentSites ) )
	);

	const isFetchingInstalledPlugins = useSelector( ( state ) =>
		isRequesting( state, currentSites[ 0 ].ID )
	);

	// When we are in plugins/:siteId select the first plugin that is not installed, otherwise always showcase
	// the first in the list.
	const selectedPlugin =
		currentSites.length === 1
			? eligiblePlugins.find( ( eligiblePlugin ) => {
					const pluginFound = !! sitePlugins.find(
						( sitePlugin: { slug: string } ) => sitePlugin.slug === eligiblePlugin.slug
					);
					return ! pluginFound;
			  } )
			: eligiblePlugins[ 0 ];

	// Fetch the selected plugin data from wpcom endpoint
	const {
		data: spotlightPlugin,
		isFetched: spotlightPluginFetched,
		// nitpick to fix a typescript issue
	} = useWPCOMPlugin( selectedPlugin?.slug ?? '', { enabled: !! selectedPlugin } );

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
					taglineText={ selectedPlugin?.tagline ?? '' }
					titleText={ selectedPlugin?.title ?? '' }
					ctaText={ selectedPlugin?.cta ?? '' }
					illustrationSrc={ spotlightPlugin?.icon ?? '' }
				/>
			) }
		</>
	);
};

export default PluginSpotlight;
