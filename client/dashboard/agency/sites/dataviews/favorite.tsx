import { agencySiteFavoriteMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import { Favorite } from '../../../sites/site-fields/favorite';
import type { AgencySite } from '@automattic/api-core';
import type { Field, Operator } from '@wordpress/dataviews';

export const FAVORITE_FIELD = 'is_favorite';

function AgencySiteFavorite( { site }: { site: AgencySite } ) {
	const { mutate } = useMutation(
		withSnackbar( agencySiteFavoriteMutation( site.blog_id ), {
			error: __( 'Failed to update favorites.' ),
		} )
	);
	return <Favorite isFavorite={ !! site.is_favorite } onToggle={ mutate } />;
}

export function getFavoriteField(): Field< AgencySite > {
	return {
		id: FAVORITE_FIELD,
		type: 'boolean',
		label: __( 'Favorite' ),
		// The agency endpoint only sorts by URL.
		enableSorting: false,
		getValue: ( { item } ) => !! item.is_favorite,
		render: ( { item } ) => <AgencySiteFavorite site={ item } />,
		// The endpoint can only narrow the list to favorites, not exclude them.
		elements: [ { value: true, label: __( 'Yes' ) } ],
		filterBy: {
			operators: [ 'is' as Operator ],
		},
	};
}
