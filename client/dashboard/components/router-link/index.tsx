import { createLink } from '@tanstack/react-router';
import { Link } from '@wordpress/ui';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

/**
 * Renders the design system's `Link` as a TanStack Router link.
 */
function RouterLink(
	props: ComponentPropsWithoutRef< typeof Link >,
	ref: React.Ref< HTMLAnchorElement >
) {
	return <Link ref={ ref } { ...props } />;
}

export default createLink( forwardRef( RouterLink ) );
