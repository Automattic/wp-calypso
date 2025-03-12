import config from '@automattic/calypso-config';
import { useLayoutEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { FunctionComponent, ReactNode } from 'react';

const RootChild: FunctionComponent< { children: ReactNode } > = ( { children } ) => {
	// we can render the children only after the container DOM element has been created and added
	// to the DOM tree. And we can't create and append the element in component constructor because
	// there is no corresponding destructor that would safely remove it in case the render is not
	// committed by React.
	//
	// A seemingly possible approach is to create the element in constructor, render the portal into
	// it and then add it to `document.body` in `componentDidMount`. But that creates another subtle
	// bug: the portal is rendered into a DOM element that's not part of the DOM tree and therefore
	// is not part of layout and painting, and has no dimensions. Many component's lifecycles and
	// effect hooks rightfully assume that the element can be measured in `componentDidMount` or
	// `useEffect`.
	//
	// Another thing that fails inside a detached DOM element is accessing `iframe.contentWindow`.
	// The `contentWindow` is `null` until the `iframe` becomes active, i.e., is added to the DOM
	// tree. We access the `contentWindow` in `WebPreview`, for example.
	const [ containerEl, setContainerEl ] = useState< HTMLDivElement | null >( null );

	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const isSiteJetpack = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: true } )
	);
	const isWPAdmin = config.isEnabled( 'is_odyssey' );

	const customTheme = useMemo( () => {
		// Calypso deals with admin colors already, so skip if not in WP Admin.
		if ( ! isWPAdmin ) {
			return null;
		}
		// All Jetpack sites should be in Jetpack colors, including Atomic sites.
		if ( isSiteJetpack ) {
			return 'is-jetpack';
		}
		// For simple sites, we read the admin color from the body class, and convert it to Calypso theme class.
		for ( const className of document.body.classList ) {
			if ( className.startsWith( 'admin-color-' ) ) {
				return `is-${ className.replace( 'admin-color-', '' ) }`;
			}
		}
		// Otherwise, no custom theme.
		return null;
	}, [ isSiteJetpack, isWPAdmin ] );

	useLayoutEffect( () => {
		// create the container element and immediately trigger a rerender
		const element = document.createElement( 'div' );
		element.className = `color-scheme ${ customTheme }`;
		document.body.appendChild( element );
		setContainerEl( element );

		return () => {
			document.body.removeChild( element );
		};
	}, [] );

	if ( ! containerEl ) {
		// don't render anything until the `containerEl` is created. That's the correct behavior
		// in SSR (no portals there, `RootChild` renders as empty).
		return null;
	}

	return ReactDOM.createPortal( children, containerEl );
};

export default RootChild;
