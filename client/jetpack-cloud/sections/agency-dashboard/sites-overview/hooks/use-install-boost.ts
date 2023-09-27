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
		onMutate: async () => {
			// Cancel any current refetches, so they don't overwrite our optimistic update
			await queryClient.cancelQueries( queryKey );

			// Snapshot the previous value
			const previousSites = queryClient.getQueryData( queryKey );

			// Optimistically update to the new value
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

			// Store previous settings in case of failure
			return { previousSites };
		},
	} );

	const errorMessage = translate(
		'Something went wrong while installing Boost. Please try again.'
	);

	const handleRequestBoostScore = useCallback( () => {
		requestBoostScore( { site_ids: [ siteId ] } );
	}, [ requestBoostScore, siteId ] );

	const handleRequestBoostScoreSuccess = useCallback( async () => {
		// TODO: Add a mutation to update the site's boost status
	}, [] );

	useEffect( () => {
		if ( requestBoostStatus === 'success' ) {
			setStatus( 'success' );
			dispatch(
				successNotice(
					translate(
						'Boost has been installed and activated. You can now configure Boost settings.'
					)
				)
			);
			handleRequestBoostScoreSuccess();
		}
		if ( requestBoostStatus === 'error' ) {
			dispatch( errorNotice( errorMessage ) );
		}
	}, [ requestBoostStatus, dispatch, errorMessage, translate, handleRequestBoostScoreSuccess ] );

	const installPlugin = useInstallPluginMutation( {
		retry: false,
	} );

	const installBoost = () => {
		installPlugin.mutate( {
			site_id: siteId,
			plugin_slug: 'jetpack_boost',
		} );
	};

	useEffect( () => {
		if ( installPlugin.status === 'loading' ) {
			setStatus( 'progress' );
		}
		if ( installPlugin.status === 'success' ) {
			handleRequestBoostScore();
		}
		if ( installPlugin.status === 'error' ) {
			dispatch( errorNotice( errorMessage ) );
		}
	}, [ installPlugin.status, siteId, dispatch, errorMessage, handleRequestBoostScore ] );

	return {
		installBoost,
		status,
		requestBoostScore: handleRequestBoostScore,
	};
}
