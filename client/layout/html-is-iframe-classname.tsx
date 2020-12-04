/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import isIframeForHtmlElement from 'calypso/state/selectors/is-iframe-for-html-element';

const HtmlIsIframeClassname = () => {
	const isIframe = useSelector( isIframeForHtmlElement );

	useEffect( () => {
		const htmlNode = document.querySelector( 'html' );

		if ( ! htmlNode ) {
			return;
		}

		if ( isIframe ) {
			// App state dictates the html node should have class `is-iframe`. Add it.
			htmlNode.classList.add( 'is-iframe' );

			// Remove the CSS class from the html node in the effect cleanup function
			return () => htmlNode.classList.remove( 'is-iframe' );
		}

		// App state dictates the html node should not have class `is-iframe`. Remove it.
		htmlNode.classList.remove( 'is-iframe' );
	}, [ isIframe ] );

	return null;
};

export default HtmlIsIframeClassname;
