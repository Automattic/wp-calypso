import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { Icon, starFilled, starEmpty } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useState } from 'react';
import { getSelectedFilters } from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard/get-selected-filters';
import SitesDashboardContext from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-context';
import useToggleFavoriteSiteMutation from 'calypso/data/agency-dashboard/use-toggle-favourite-site-mutation';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice, removeNotice } from 'calypso/state/notices/actions';
import type {
	APIError,
	Site,
	APIToggleFavorite,
	ToggleFavoriteOptions,
	AgencyDashboardFilter,
} from '../types';
import './style.scss';

interface Props {
	isFavorite: boolean;
	siteId: number;
	siteUrl: string;
}

export default function SiteSetFavorite( { isFavorite, siteId, siteUrl }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );
	const { dataViewsState, showOnlyFavorites, currentPage } = useContext( SitesDashboardContext );
	const [ filter, setAgencyDashboardFilter ] = useState< AgencyDashboardFilter >( {
		issueTypes: [],
		showOnlyFavorites: showOnlyFavorites || false,
	} );
	useEffect( () => {
		const selectedFilters = getSelectedFilters( dataViewsState.filters );

		setAgencyDashboardFilter( {
			issueTypes: selectedFilters,
			showOnlyFavorites: showOnlyFavorites || false,
		} );
	}, [ dataViewsState.filters, showOnlyFavorites ] );
	const search = dataViewsState.search;

	const queryKey = [
		'jetpack-agency-dashboard-sites',
		search,
		currentPage,
		filter,
		dataViewsState.sort,
		dataViewsState.perPage,
		...( agencyId ? [ agencyId ] : [] ),
	];

	const siblingQueryKey = [
		'jetpack-agency-dashboard-sites',
		search,
		currentPage,
		{ ...filter, ...dataViewsState.sort, showOnlyFavorites: ! showOnlyFavorites },
		...( agencyId ? [ agencyId ] : [] ),
	];
	const successNoticeId = 'success-notice';

	const handleViewFavorites = () => {
		dispatch( removeNotice( successNoticeId ) );
		page.redirect( '/dashboard/favorites?highlight=favorite-tab' );
	};

	const handleOnChangeFavoriteSuccess = ( isFavorite: boolean ) => {
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
				await queryClient.cancelQueries( {
					queryKey,
				} );

				// Snapshot the previous value
				const previousSites = queryClient.getQueryData( queryKey );
				// Optimistically update to the new value
				queryClient.setQueryData( queryKey, ( oldSites: any ) => {
					return {
						...oldSites,
						sites: oldSites?.sites?.map( ( site: Site ) => {
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

				// Optimistically update the favorites count of the current query and the sibling query
				const updateTotalFavorites = ( oldSites: any ) => {
					const currentCount = oldSites?.total_favorites || 0;
					return {
						...oldSites,
						// Prevent value being set to negative
						total_favorites: Math.max( currentCount + ( isFavorite ? -1 : 1 ), 0 ),
					};
				};
				queryClient.setQueryData( queryKey, updateTotalFavorites );
				queryClient.setQueryData( siblingQueryKey, updateTotalFavorites );

				// Store previous settings in case of failure
				return { previousSites };
			},
			onSuccess: ( _data: APIToggleFavorite, options: ToggleFavoriteOptions ) => {
				handleOnChangeFavoriteSuccess( options.isFavorite );
			},
			onError: ( error: APIError, options: any, context: any ) => {
				queryClient.setQueryData( queryKey, context?.previousSites );
				const errorMessage = error.message;
				dispatch( errorNotice( errorMessage ) );
			},
			onSettled: () => {
				queryClient.invalidateQueries( {
					queryKey,
				} );
			},
		};
	};

	const { isPending, mutate } = useToggleFavoriteSiteMutation( handleMutation() );

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleFavoriteChange = ( e: any ) => {
		mutate( {
			siteId,
			isFavorite,
			agencyId: agencyId || 0, // Provide a default value for agencyId
		} );
		dispatch(
			recordTracksEvent(
				isFavorite
					? 'calypso_jetpack_agency_dashboard_remove_favorite_site'
					: 'calypso_jetpack_agency_dashboard_set_favorite_site'
			)
		);
		e.stopPropagation();
	};

	return (
		<Button
			borderless
			compact
			disabled={ isPending }
			onClick={ handleFavoriteChange }
			className={ clsx(
				'site-set-favorite__favorite-icon',
				'disable-card-expand',
				isFavorite && 'site-set-favorite__favorite-icon-active'
			) }
			aria-label={ translate( 'Toggle favorite site' ) }
		>
			<Icon size={ 24 } icon={ isFavorite ? starFilled : starEmpty } />
		</Button>
	);
}
