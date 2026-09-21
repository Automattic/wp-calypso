import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

export type StatsSettings = {
	admin_bar: boolean;
	roles: string[];
	count_roles: string[];
	wpcom_reader_views_enabled: boolean;
};

export type StatsSettingsResponse = {
	settings: StatsSettings;
	roles: Array< { slug: string; name: string } >;
};

const statsSettingsQueryKey = ( siteId: number | null ) => [ 'stats', 'settings', siteId ];

// Odyssey sends this to the site's own `jetpack/v4/stats-app` route, where the settings live.
const statsSettingsPath = ( siteId: number | null ) => `/sites/${ siteId }/jetpack-stats/settings`;

/**
 * Read the Stats settings and the site's roles.
 * @param siteId Site to query.
 */
export function useStatsSettingsQuery( siteId: number | null ) {
	return useQuery< StatsSettingsResponse >( {
		...getDefaultQueryParams(),
		queryKey: statsSettingsQueryKey( siteId ),
		queryFn: () => wpcom.req.get( { apiNamespace: 'wpcom/v2', path: statsSettingsPath( siteId ) } ),
		enabled: !! siteId,
	} );
}

/**
 * Save some Stats settings. The page shows the change at once and puts the old values back when
 * the site refuses them.
 * @param siteId Site to update.
 */
export function useStatsSettingsMutation( siteId: number | null ) {
	const queryClient = useQueryClient();
	const queryKey = statsSettingsQueryKey( siteId );

	return useMutation<
		StatsSettingsResponse,
		unknown,
		Partial< StatsSettings >,
		{ previous?: StatsSettingsResponse }
	>( {
		mutationFn: ( values ) =>
			wpcom.req.post( {
				apiNamespace: 'wpcom/v2',
				path: statsSettingsPath( siteId ),
				body: values,
			} ),
		onMutate: async ( values ) => {
			await queryClient.cancelQueries( { queryKey } );
			const previous = queryClient.getQueryData< StatsSettingsResponse >( queryKey );
			if ( previous ) {
				queryClient.setQueryData< StatsSettingsResponse >( queryKey, {
					...previous,
					settings: { ...previous.settings, ...values },
				} );
			}
			return { previous };
		},
		onError: ( _error, _values, context ) => {
			if ( context?.previous ) {
				queryClient.setQueryData( queryKey, context.previous );
			}
		},
		onSuccess: ( response ) => {
			queryClient.setQueryData( queryKey, response );
		},
	} );
}
