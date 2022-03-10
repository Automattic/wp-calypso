import { createHigherOrderComponent } from '@wordpress/compose';
import usePluginsQuery from './use-plugins-query';

const withInstalledPlugins = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const data = usePluginsQuery( props.siteIds );
		return <Wrapped { ...props } installedPlugins={ data ?? [] } />;
	},
	'WithInstalledPlugins'
);

export default withInstalledPlugins;
