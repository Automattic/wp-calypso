import styled from '@emotion/styled';
import { Icon, starEmpty, starFilled } from '@wordpress/icons';
import { useState } from 'react';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import {
	useAddSiteFavorite,
	useDeleteSiteFavorite,
} from 'calypso/sites-dashboard/hooks/use-site-favorite-mutation';

const SiteFavoriteContainer = styled.tr( {
	cursor: 'pointer',
} );

const SitesFavorite = ( { site }: { site: SiteExcerptData } ) => {
	const [ isFavorite, setIsFavorite ] = useState( site.is_user_favorite );
	const { addSiteFavorite } = useAddSiteFavorite( site.ID, {
		onError: () => {
			setIsFavorite( ! isFavorite );
		},
	} );

	const { deleteSiteFavorite } = useDeleteSiteFavorite( site.ID, {
		onError: () => {
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
