/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import isIframeForHtmlElement from 'state/selectors/is-iframe-for-html-element';

const HtmlIsIframeClassname = () => {
	const isIframe = useSelector( isIframeForHtmlElement );

	useEffect( () => {
		const htmlNode = document.querySelector( 'html' );

		if ( ! htmlNode ) {
			return;
		}

		if ( isIframe ) {
			htmlNode.classList.add( 'is-iframe' );
			return () => htmlNode.classList.remove( 'is-iframe' );
		}

		htmlNode.classList.remove( 'is-iframe' );
	}, [ isIframe ] );

	return null;
};

export default HtmlIsIframeClassname;
