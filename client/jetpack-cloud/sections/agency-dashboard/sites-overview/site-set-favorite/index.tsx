import { Gridicon, Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { ReactElement, useContext } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import useToggleFavoriteSiteMutation from 'calypso/data/agency-dashboard/use-toggle-favourite-site-mutation';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice, removeNotice } from 'calypso/state/notices/actions';
import SitesOverviewContext from '../context';
import type { APIError, Site } from '../types';

import './style.scss';

interface Props {
	isFavorite: boolean;
	siteId: number;
	siteUrl: string;
}

export default function SiteSetFavorite( { isFavorite, siteId, siteUrl }: Props ): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	const { filter, search, currentPage } = useContext( SitesOverviewContext );
	const { showOnlyFavorites } = filter;
	const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter ];
	const siblingQueryKey = [
		'jetpack-agency-dashboard-sites',
		search,
		currentPage,
		{ ...filter, showOnlyFavorites: ! showOnlyFavorites },
	];
	const successNoticeId = 'success-notice';

	const handleViewFavorites = () => {
		dispatch( removeNotice( successNoticeId ) );
		page.redirect( '/dashboard/favorites?highlight=favorite-tab' );
	};

	const handleOnChangeFavoriteSuccess = () => {
		const text = (
			<span>
				{ ! isFavorite
					? translate( '%(siteUrl)s has been added to your favorites.', {
							args: {
								siteUrl,
							},
					  } )
					: translate( '%(siteUrl)s has been removed from your favorites.', {
							args: {
								siteUrl,
							},
					  } ) }
				{ ! showOnlyFavorites && (
					<Button
						className="site-set-favorite__view-favorite"
						borderless
						compact
						onClick={ handleViewFavorites }
					>
						{ translate( 'View Favorites' ) }
					</Button>
				) }
			</span>
		);
		const options = {
			id: successNoticeId,
		};
		dispatch( removeNotice( successNoticeId ) );
		dispatch( successNotice( text, options ) );
	};

	const handleMutation = () => {
		return {
			onMutate: async ( { siteId, isFavorite }: { siteId: number; isFavorite: boolean } ) => {
				// Cancel any current refetches, so they don't overwrite our optimistic update
				await queryClient.cancelQueries( queryKey );

				// Snapshot the previous value
				const previousSites = queryClient.getQueryData( queryKey );

				// Optimistically update to the new value
				queryClient.setQueryData( queryKey, ( oldSites: any ) => {
					return {
						...oldSites,
						sites: oldSites?.sites.map( ( site: Site ) => {
							if ( site.blog_id === siteId ) {
								return {
									...site,
									is_favorite: ! isFavorite,
								};
							}
							return site;
						} ),
					};
				} );

				// Optimistically update the favorites count of the current query and the sibling query.
				const updateTotalFavorites = ( oldSites: any ) => {
					return {
						...oldSites,
						total_favorites: oldSites.total_favorites + ( isFavorite ? -1 : 1 ),
					};
				};
				queryClient.setQueryData( queryKey, updateTotalFavorites );
				queryClient.setQueryData( siblingQueryKey, updateTotalFavorites );

				// Store previous settings in case of failure
				return { previousSites };
			},
			onSuccess: () => {
				handleOnChangeFavoriteSuccess();
			},
			onError: ( error: APIError, options: any, context: any ) => {
				queryClient.setQueryData( queryKey, context?.previousSites );
				const errorMessage = error.message;
				dispatch( errorNotice( errorMessage ) );
			},
			onSettled: () => {
				queryClient.invalidateQueries( queryKey );
			},
		};
	};

	const { isLoading, mutate } = useToggleFavoriteSiteMutation( handleMutation() );

	const handleFavoriteChange = () => {
		mutate( { siteId, isFavorite } );
		dispatch(
			recordTracksEvent(
				isFavorite
					? 'calypso_jetpack_agency_dashboard_remove_favorite_site'
					: 'calypso_jetpack_agency_dashboard_set_favorite_site'
			)
		);
	};

	return (
		<>
			<Button
				borderless
				compact
				disabled={ isLoading }
				onClick={ handleFavoriteChange }
				className={ classNames(
					'site-set-favorite__favorite-icon',
					isFavorite && 'site-set-favorite__favorite-icon-active'
				) }
			>
				<Gridicon size={ 18 } icon={ isFavorite ? 'star' : 'star-outline' } />
			</Button>
		</>
	);
}
