/**
 * External dependencies
 */
import * as React from 'react';
import { useLocation } from 'react-router-dom';

type ScrollToTopProps = {
	selector?: string;
};

const ScrollToTop: React.FunctionComponent< ScrollToTopProps > = ( { selector } ) => {
	const { pathname } = useLocation();

	React.useEffect( () => {
		selector ? document.querySelector( selector )?.scrollTo( 0, 0 ) : window.scrollTo( 0, 0 );
	}, [ selector, pathname ] );

	return null;
};

export default ScrollToTop;
