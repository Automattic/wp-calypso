import { useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import useInstallPluginMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-install-plugin-mutation';
import useRequestBoostScoreMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-request-boost-score-mutation';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import type { Site } from '../types';

export default function useInstallBoost(
	siteId: number,
	siteUrl: string,
	queryKey: any[]
): {
	installBoost: () => void;
	status: string;
	requestBoostScore: () => void;
} {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	const [ status, setStatus ] = useState( 'idle' );

	const { mutate: requestBoostScore, status: requestBoostStatus } = useRequestBoostScoreMutation( {
		retry: false,
	} );

	const errorMessage = translate(
		'Something went wrong while installing Boost. Please try again.'
	);

	const handleRequestBoostScore = useCallback( () => {
		requestBoostScore( { site_ids: [ siteId ] } );
	}, [ requestBoostScore, siteId ] );

	const handleUpdateSites = useCallback( async () => {
		// Cancel any current refetches, so they don't overwrite our update
		await queryClient.cancelQueries( queryKey );

		// Update to the new value
		const updatedData = queryClient.setQueryData( queryKey, ( oldSites: any ) => {
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
		queryClient.setQueryData( queryKey, updatedData );
	}, [ queryClient, queryKey, siteId ] );

	useEffect( () => {
		if ( requestBoostStatus === 'success' ) {
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
			setStatus( 'success' );
			handleUpdateSites();
		}
		if ( requestBoostStatus === 'error' ) {
			dispatch( errorNotice( errorMessage ) );
		}
	}, [ dispatch, errorMessage, handleUpdateSites, requestBoostStatus, siteUrl, translate ] );

	const { mutate: installPlugin, status: installPluginStatus } = useInstallPluginMutation( {
		retry: false,
	} );

	const installBoost = () => {
		installPlugin( {
			site_id: siteId,
			plugin_slug: 'jetpack_boost',
		} );
	};

	useEffect( () => {
		if ( installPluginStatus === 'loading' ) {
			setStatus( 'progress' );
		}
		if ( installPluginStatus === 'success' ) {
			handleRequestBoostScore();
		}
		if ( installPluginStatus === 'error' ) {
			dispatch( errorNotice( errorMessage ) );
		}
	}, [ dispatch, errorMessage, handleRequestBoostScore, installPluginStatus ] );

	return {
		installBoost,
		status,
		requestBoostScore: handleRequestBoostScore,
	};
}
