/**
 * This is a replacement for RootChild component in calypso/components.
 * The the new RootChild component supports setting the Calypso color scheme based on the selected site's admin color.
 * Location: https://github.com/Automattic/wp-calypso/blob/322700bb214dfcffa06cf33d88e333c576493965/packages/components/src/root-child/index.tsx
 */
import { useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import useWPAdminTheme from 'calypso/my-sites/stats/hooks/use-wp-admin-theme';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { FunctionComponent, ReactNode } from 'react';

const RootChild: FunctionComponent< { children: ReactNode } > = ( { children } ) => {
	const [ containerEl, setContainerEl ] = useState< HTMLDivElement | null >( null );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const customTheme = useWPAdminTheme( siteId );

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
