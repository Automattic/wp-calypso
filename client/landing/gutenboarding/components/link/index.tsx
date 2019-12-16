/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { Link as RouterLink, LinkProps } from 'react-router-dom';
import React, { forwardRef, FunctionComponent } from 'react';
import { Assign } from 'utility-types';

interface LinkButtonProps extends Button.AnchorProps {
	navigate: () => void;
}
// Render `Link` with `@wordpress/components` `Button`
// Needs to handle `navigate` onClick
// from https://github.com/ReactTraining/react-router/blob/e81dfa2d01937969ee3f9b1f33c9ddd319f9e091/packages/react-router-dom/modules/Link.js#L21
const LinkButton = forwardRef< HTMLAnchorElement, LinkButtonProps >(
	( { navigate, onClick, ...rest }, forwardedRef ) => {
		const { target } = rest;
		const props = {
			...rest,
			onClick: event => {
				try {
					if ( onClick ) onClick( event );
				} catch ( ex ) {
					event.preventDefault();
					throw ex;
				}

				if (
					! event.defaultPrevented && // onClick prevented default
					event.button === 0 && // ignore everything but left clicks
					( ! target || target === '_self' ) && // let browser handle "target=_blank" etc.
					! isModifiedEvent( event ) // ignore clicks with modifier keys
				) {
					event.preventDefault();
					navigate();
				}
			},
		};
		return <Button ref={ forwardedRef } { ...props } />;
	}
);

type Props = Omit<
	Assign<
		Button.AnchorProps,
		Assign< Omit< LinkProps, 'component' >, Partial< Pick< LinkProps, 'to' > > >
	>,
	'disabled'
>;

const Link: FunctionComponent< Props > = ( { children, ...props } ) => {
	if ( props.to ) {
		return (
			<RouterLink { ...props } component={ LinkButton }>
				{ children }
			</RouterLink>
		);
	}

	const { ...buttonProps } = props;
	return (
		<Button disabled { ...buttonProps }>
			{ children }
		</Button>
	);
};
export default Link;

function isModifiedEvent( event ) {
	return !! ( event.metaKey || event.altKey || event.ctrlKey || event.shiftKey );
}
