/**
 * External dependencies
 */
import * as React from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FunctionComponent | null = () => {
	const { pathname } = useLocation();

	React.useEffect( () => document.querySelector( '.components-modal__content' )?.scrollTo( 0, 0 ), [
		pathname,
	] );

	return null;
};

export default ScrollToTop;
