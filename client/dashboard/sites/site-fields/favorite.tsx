import './favorite.scss';

import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { starEmpty, starFilled } from '@wordpress/icons';
import clsx from 'clsx';
import type { MouseEvent } from 'react';

export function Favorite( {
	isFavorite,
	onToggle,
}: {
	isFavorite: boolean;
	onToggle: ( isFavorite: boolean ) => void;
} ) {
	const handleClick = ( event: MouseEvent ) => {
		// The row is clickable, and starring a site shouldn't open it.
		event.stopPropagation();
		onToggle( ! isFavorite );
	};

	return (
		<Button
			className={ clsx( 'site-favorite', { 'is-favorite': isFavorite } ) }
			icon={ isFavorite ? starFilled : starEmpty }
			label={ isFavorite ? __( 'Remove from favorites' ) : __( 'Add to favorites' ) }
			size="small"
			onClick={ handleClick }
		/>
	);
}
