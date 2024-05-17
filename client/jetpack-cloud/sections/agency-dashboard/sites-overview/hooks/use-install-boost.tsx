import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import useInstallPluginMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-install-plugin-mutation';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import type { Site } from '../types';

export default function useInstallBoost(
	siteId: number,
	siteUrl: string,
	queryKey: any[]
): {
	installBoost: () => void;
	status: string;
} {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const agency = useSelector( getActiveAgency );
	const agencyId = agency ? agency.id : undefined;

	const handleUpdateSites = useCallback( async () => {
		// Cancel any current refetches, so they don't overwrite our update
		await queryClient.cancelQueries( { queryKey } );

		// Update to the new value
		queryClient.setQueryData( queryKey, ( oldSites: any ) => {
			return {
				...oldSites,
				sites: oldSites?.sites.map( ( site: Site ) => {
					if ( site.blog_id === siteId ) {
						return {
							...site,
							has_pending_boost_one_time_score: true,
						};
					}
					return site;
				} ),
			};
		} );
	}, [ queryClient, queryKey, siteId ] );

	const { mutate: installPlugin, status } = useInstallPluginMutation( {
		retry: false,
	} );

	const installBoost = () => {
		installPlugin( {
			site_id: siteId,
			plugin_slug: 'jetpack_boost',
			agency_id: agencyId,
		} );
	};

	useEffect( () => {
		if ( status === 'success' ) {
			dispatch(
				successNotice(
					translate(
						'Jetpack Boost was successfully added to {{em}}%(siteUrl)s{{/em}}. Please allow a few minutes for performance score calculation.',
						{
							args: { siteUrl },
							comment: '%(siteUrl)s is the site url. Eg: example.com',
							components: {
								em: <em />,
							},
						}
					)
				)
			);
			handleUpdateSites();
		}
		if ( status === 'error' ) {
			dispatch(
				errorNotice( translate( 'Something went wrong while installing Boost. Please try again.' ) )
			);
		}
	}, [ dispatch, handleUpdateSites, status, siteUrl, translate ] );

	return {
		installBoost,
		status,
	};
}
