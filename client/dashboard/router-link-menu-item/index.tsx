import { createLink } from '@tanstack/react-router';
import { MenuItem } from '@wordpress/components';
import { WordPressComponentProps } from '@wordpress/components/build-types/context/wordpress-component';
import { MenuItemProps } from '@wordpress/components/build-types/menu-item/types';
import { forwardRef } from 'react';

export function RouterLinkMenuItem(
	props: WordPressComponentProps< MenuItemProps, 'button', false >,
	ref: React.Ref< HTMLButtonElement >
) {
	return <MenuItem ref={ ref } { ...props } />;
}

export default createLink( forwardRef( RouterLinkMenuItem ) );
