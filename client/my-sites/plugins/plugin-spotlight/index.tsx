import page from 'page';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Spotlight from 'calypso/components/spotlight';
import { useWPCOMPlugin, useWPCOMPlugins } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const useRandomPlugin = ( eligiblePlugins: any[] ) => {
	const [ eligiblePlugin, setEligiblePlugin ] = useState();

	useEffect( () => {
		setEligiblePlugin( eligiblePlugins[ Math.floor( Math.random() * eligiblePlugins.length ) ] );
	}, [ JSON.stringify( eligiblePlugins ) ] );

	return eligiblePlugin;
};

const PluginSpotlight = ( { eligiblePlugins, site } ) => {
	const { data: spotlightPlugin, isFetched: spotlightPluginFetched } = useWPCOMPlugin(
		'wordpress-seo-premium'
	);
	const { data: plugins = [], isFetched: pluginsFetched } = useWPCOMPlugins( 'featured' );

	const eligiblePlugin = useRandomPlugin( eligiblePlugins );

	const dispatch = useDispatch();

	// #TODO: remove this and combinedPlugins when wordpress seo premium is enabled
	if ( ! spotlightPluginFetched || ! pluginsFetched ) {
		return <></>;
	}

	const combinedPlugins = [ ...plugins, spotlightPlugin ];

	const selectedPlugin = combinedPlugins.find(
		( plugin ) => plugin.slug === eligiblePlugin?.pluginSlug
	);

	const spotlightOnClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_marketplace_spotlight_click', {
				type: 'plugin',
				slug: selectedPlugin.slug,
				id: selectedPlugin.id,
				site: site,
			} )
		);
		page( `/plugins/${ selectedPlugin.slug }/${ site || '' }` );
	};

	return (
		<>
			{ selectedPlugin && eligiblePlugin && (
				<Spotlight
					onClick={ spotlightOnClick }
					taglineText={ eligiblePlugin.tagline }
					titleText={ eligiblePlugin.title }
					ctaText={ eligiblePlugin.cta }
					illustrationSrc={ selectedPlugin?.icon ?? '' }
				/>
			) }
		</>
	);
};

export default PluginSpotlight;
