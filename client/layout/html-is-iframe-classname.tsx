/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import isIframeForHtmlElement from 'state/selectors/is-iframe-for-html-element';

const debug = debugFactory( 'calypso:layout:html-is-iframe-classname' );

const HtmlIsIframeClassname = () => {
	const isIframe = useSelector( isIframeForHtmlElement );

	useEffect( () => {
		const htmlNode = document.querySelector( 'html' );

		if ( ! htmlNode ) {
			debug( 'no html node' );
			return;
		}

		if ( isIframe ) {
			debug( 'adding is-iframe' );
			htmlNode.classList.add( 'is-iframe' );
			return () => htmlNode.classList.remove( 'is-iframe' );
		}
		debug( 'removing is-iframe' );
		htmlNode.classList.remove( 'is-iframe' );
	}, [ isIframe ] );

	return null;
};

export default HtmlIsIframeClassname;
