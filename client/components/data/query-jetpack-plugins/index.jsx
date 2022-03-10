import usePluginsQuery from 'calypso/data/plugins/installed/use-plugins-query';

export default function QueryJetpackPlugins( props ) {
	usePluginsQuery( props.siteIds );
	return null;
}
