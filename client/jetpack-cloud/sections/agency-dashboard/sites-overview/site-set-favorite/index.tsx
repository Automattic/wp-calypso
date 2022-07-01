import { Gridicon, Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { ReactElement, useContext, useState } from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import useRemoveFavoriteSiteMutation from 'calypso/data/agency-dashboard/use-remove-favourite-site-mutation';
import useSetFavoriteSiteMutation from 'calypso/data/agency-dashboard/use-set-favourite-site-mutation';
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

	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const { filter, search, currentPage } = useContext( SitesOverviewContext );
	const { showOnlyFavorites } = filter;
	const queryKey = [ 'jetpack-agency-dashboard-sites', search, currentPage, filter ];

	const successNoticeId = 'success-notice';

	const handleViewFavorites = () => {
		dispatch( removeNotice( successNoticeId ) );
		page.redirect( '/dashboard/favorites?highlight=favorite-tab' );
	};

	const handleOnChangeFavoriteSuccess = () => {
		setIsSubmitting( false );
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
			onMutate: async () => {
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
									is_favorite: ! site.is_favorite,
								};
							}
							return site;
						} ),
					};
				} );

				// Store previous settings in case of failure
				return { previousSites };
			},
			onSuccess: () => {
				handleOnChangeFavoriteSuccess();
			},
			onError: ( error: APIError, _siteId: number, context: any ) => {
				queryClient.setQueryData( queryKey, context?.previousSites );
				setIsSubmitting( false );
				const errorMessage = error.message;
				dispatch( errorNotice( errorMessage ) );
			},
			onSettled: () => {
				queryClient.invalidateQueries( queryKey );
			},
		};
	};

	const setFavorite = useSetFavoriteSiteMutation( handleMutation() );

	const removeFavorite = useRemoveFavoriteSiteMutation( handleMutation() );

	const handleFavoriteChange = () => {
		setIsSubmitting( true );
		isFavorite ? removeFavorite.mutate( siteId ) : setFavorite.mutate( siteId );
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
				disabled={ isSubmitting }
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
