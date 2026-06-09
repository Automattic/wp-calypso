import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../../app/context';

/**
 * Sites for the plugin-management surfaces. Unlike the rest of the dashboard,
 * these intentionally include staging sites so plugins can be managed on them.
 */
export const usePluginSites = () => {
	const { queries } = useAppContext();
	return useQuery(
		queries.sitesQuery( {
			site_visibility: 'visible',
			include_a8c_owned: false,
			include_staging: true,
		} )
	);
};
