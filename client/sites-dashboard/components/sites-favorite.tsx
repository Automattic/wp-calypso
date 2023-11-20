import styled from '@emotion/styled';
import { Icon, starEmpty, starFilled } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useState } from 'react';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import {
	useAddSiteFavorite,
	useDeleteSiteFavorite,
} from 'calypso/sites-dashboard/hooks/use-site-favorite-mutation';
import { useDispatch } from 'calypso/state';
import { errorNotice, removeNotice, successNotice } from 'calypso/state/notices/actions';

const SiteFavoriteContainer = styled.tr( {
	cursor: 'pointer',
} );

const addSiteFavoriteSuccessNoticeKey = 'add-site-favorite-success';
const addSiteFavoriteFailureNoticeKey = 'add-site-favorite-failure';
const deleteSiteFavoriteSuccessNoticeKey = 'delete-site-favorite-success';
const deleteSiteFavoriteFailureNoticeKey = 'delete-site-favorite-failure';

const SitesFavorite = ( { site }: { site: SiteExcerptData } ) => {
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const [ isFavorite, setIsFavorite ] = useState( site.is_user_favorite );

	const removeAllNotices = () => {
		dispatch( removeNotice( addSiteFavoriteSuccessNoticeKey ) );
		dispatch( removeNotice( addSiteFavoriteFailureNoticeKey ) );
		dispatch( removeNotice( deleteSiteFavoriteSuccessNoticeKey ) );
		dispatch( removeNotice( deleteSiteFavoriteFailureNoticeKey ) );
	};
	const { addSiteFavorite } = useAddSiteFavorite( site.ID, {
		onMutate: () => {
			removeAllNotices();
		},
		onSuccess: useCallback( () => {
			dispatch(
				successNotice( __( 'Your site added to favorites successfully.' ), {
					id: addSiteFavoriteSuccessNoticeKey,
				} )
			);
		}, [ dispatch, __ ] ),
		onError: useCallback( () => {
			dispatch(
				errorNotice( __( 'Site failed to be added to favorites. Please try again.' ), {
					id: addSiteFavoriteFailureNoticeKey,
				} )
			);
			setIsFavorite( ! isFavorite );
		}, [ dispatch, __, isFavorite ] ),
	} );

	const { deleteSiteFavorite } = useDeleteSiteFavorite( site.ID, {
		onMutate: () => {
			removeAllNotices();
		},
		onSuccess: useCallback( () => {
			dispatch(
				successNotice( __( 'Your site removed from favorites.' ), {
					id: deleteSiteFavoriteSuccessNoticeKey,
				} )
			);
		}, [ dispatch, __ ] ),
		onError: () => {
			dispatch(
				errorNotice( __( 'Site failed to be removed from favorites. Please try again.' ), {
					id: deleteSiteFavoriteFailureNoticeKey,
				} )
			);
			setIsFavorite( ! isFavorite );
		},
	} );

	const handleFavoriteChange = () => {
		const isFavoriteNewValue = ! isFavorite;
		setIsFavorite( isFavoriteNewValue );
		if ( isFavoriteNewValue === true ) {
			addSiteFavorite();
			return;
		}
		if ( isFavoriteNewValue === false ) {
			deleteSiteFavorite();
			return;
		}
	};

	return (
		<SiteFavoriteContainer onClick={ handleFavoriteChange }>
			{ isFavorite ? (
				<Icon size={ 32 } icon={ starFilled } />
			) : (
				<Icon size={ 32 } icon={ starEmpty } />
			) }
		</SiteFavoriteContainer>
	);
};

export default SitesFavorite;
