import { createLink } from '@tanstack/react-router';
import { MenuItem } from '@wordpress/components';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

function RouterLinkMenuItem(
	props: ComponentPropsWithoutRef< typeof MenuItem >,
	// To do: Fix MenuItemProps so that it allows HTMLAnchorElement.
	ref: React.Ref< HTMLButtonElement >
) {
	return <MenuItem ref={ ref } { ...props } />;
}

export default createLink( forwardRef( RouterLinkMenuItem ) );
