/**
 * This is a replacement for RootChild component in calypso/components.
 * The the new RootChild component supports setting the Calypso color scheme based on the selected site's admin color.
 * Location: https://github.com/Automattic/wp-calypso/blob/322700bb214dfcffa06cf33d88e333c576493965/packages/components/src/root-child/index.tsx
 */
import config from '@automattic/calypso-config';
import { useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { FunctionComponent, ReactNode } from 'react';

// We cannot use any of the Calypso state selectors here, as the RootChild component is used in Odyssey Widget, where there is no Redux context.
const RootChild: FunctionComponent< { children: ReactNode } > = ( { children } ) => {
	const [ containerEl, setContainerEl ] = useState< HTMLDivElement | null >( null );

	const state = config( 'intial_state' );
	const siteId = config( 'blog_id' ) as number;
	const isSiteJetpack = isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } );
	const customTheme = useWPAdminTheme( isSiteJetpack );

	useLayoutEffect( () => {
		const element = document.createElement( 'div' );
		// Add the custom theme class to the container element, so that all children can inherit it.
		element.className = `color-scheme ${ customTheme }`;
		document.body.appendChild( element );
		setContainerEl( element );

		return () => {
			document.body.removeChild( element );
		};
	}, [ customTheme ] );

	if ( ! containerEl ) {
		return null;
	}

	return ReactDOM.createPortal( children, containerEl );
};

export default RootChild;
