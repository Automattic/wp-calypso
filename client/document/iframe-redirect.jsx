/**
 * External dependencies
 */
import React from 'react';

function iFrameRedirectFn( { window, siteId } ) {
	const iframedToHostingSection =
		window.parent === window.top && window.parent.location.pathname.indexOf( '/hosting/' ) === 0;

	if ( ! iframedToHostingSection ) {
		//redirect to root
		window.top.location = window.location.origin;
	}

	//only render in hosting section
	window.addEventListener( 'DOMContentLoaded', function() {
		window.document.querySelector( '#test' ).addEventListener( 'click', function( event ) {
			event.preventDefault();
			
			//... xhr to endpoint, with callback to window.open
			const exampleLink = 'http://automattic.com';
			window.parent.open( exampleLink, '_blank' );
		} );
	} );
}

function IFrameRedirect( { siteId } ) {
	return (
		<html lang="en">
			<body>
				<a href="#" id="test">
					Test Link
				</a>
				{ /* eslint-disable react/no-danger */ }
				<script
					dangerouslySetInnerHTML={ {
						__html: `
						const iFrameRedirectFn = ${ iFrameRedirectFn.toString() };

						iFrameRedirectFn( {
						    window: this,
							siteId: ${ siteId && `"${ encodeURIComponent( siteId ) }"` },
						} );
						`,
					} }
				/>
				{ /* eslint-enable react/no-danger */ }
			</body>
		</html>
	);
}

export default IFrameRedirect;
