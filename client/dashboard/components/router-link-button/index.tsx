import { createLink, LinkProps, useRouterState } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { ButtonProps } from '@wordpress/components/build-types/button/types';
import { forwardRef } from 'react';

function BaseButton( props: ButtonProps, ref: React.Ref< HTMLAnchorElement > ) {
	return <Button ref={ ref } { ...props } />;
}

const ButtonWithRouter = createLink( forwardRef( BaseButton ) );

type RouterLinkButtonProps = LinkProps< 'a' > & ButtonProps & Omit< ButtonProps, 'href' >;

/**
 * RouterLinkButton - works with TanStack Router when available,
 * falls back to regular anchor behavior for legacy Calypso routing.
 */
function RouterLinkButton( { to, children, ...props }: RouterLinkButtonProps ): JSX.Element {
	let isTanstackRouterAvailable: boolean = false;
	try {
		useRouterState();
		isTanstackRouterAvailable = true;
	} catch {
		isTanstackRouterAvailable = false;
	}

	if ( isTanstackRouterAvailable ) {
		return (
			<ButtonWithRouter to={ to } { ...props }>
				{ children }
			</ButtonWithRouter>
		);
	}

	// Fallback to regular Button with href for legacy routing.
	return (
		<Button href={ typeof to === 'string' ? to : to?.pathname } { ...props }>
			{ children }
		</Button>
	);
}

export default RouterLinkButton;
