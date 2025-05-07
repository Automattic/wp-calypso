import { createLink } from '@tanstack/react-router';
import { MenuItem } from '@wordpress/components';
import { WordPressComponentProps } from '@wordpress/components/build-types/context/wordpress-component';
import { MenuItemProps } from '@wordpress/components/build-types/menu-item/types';
import { forwardRef } from 'react';

function RouterLinkMenuItem(
	props: WordPressComponentProps< MenuItemProps, 'button', false >,
	// To do: Fix MenuItemProps so that it allows HTMLAnchorElement.
	ref: React.Ref< HTMLButtonElement >
) {
	return <MenuItem ref={ ref } { ...props } />;
}

export default createLink( forwardRef( RouterLinkMenuItem ) );
