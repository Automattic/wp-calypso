import { createLink } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { forwardRef, type ComponentProps, type PropsWithoutRef } from 'react';

function RouterLinkButton(
	props: PropsWithoutRef< ComponentProps< typeof Button > >,
	ref: React.Ref< HTMLAnchorElement >
) {
	return <Button ref={ ref } { ...props } />;
}

export default createLink( forwardRef( RouterLinkButton ) );
