/**
 * External dependencies
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

const Head = ( {
	title = 'WordPress.com',
	faviconURL,
	children,
	cdn,
	branchName,
	inlineScriptNonce,
} ) => {
	return (
		<head>
			<title>{ title }</title>

			<meta charSet="utf-8" />
			<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta name="format-detection" content="telephone=no" />
			<meta name="mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="theme-color" content="#016087" />
			<meta name="referrer" content="origin" />

			<link
				rel="prefetch"
				as="document"
				href="https://public-api.wordpress.com/wp-admin/rest-proxy/?v=2.0"
			/>

			<link
				rel="shortcut icon"
				type="image/vnd.microsoft.icon"
				href={ faviconURL }
				sizes="16x16 32x32"
			/>
			<link rel="shortcut icon" type="image/x-icon" href={ faviconURL } sizes="16x16 32x32" />
			<link rel="icon" type="image/x-icon" href={ faviconURL } sizes="16x16 32x32" />

			<link
				rel="icon"
				type="image/png"
				href={ cdn + '/i/favicons/favicon-64x64.png' }
				sizes="64x64"
			/>
			<link
				rel="icon"
				type="image/png"
				href={ cdn + '/i/favicons/favicon-96x96.png' }
				sizes="96x96"
			/>
			<link
				rel="icon"
				type="image/png"
				href={ cdn + '/i/favicons/android-chrome-192x192.png' }
				sizes="192x192"
			/>
			{ [ 57, 60, 72, 76, 114, 120, 144, 152, 180 ].map( ( size ) => (
				<link
					key={ size }
					rel="apple-touch-icon"
					sizes={ `${ size }x${ size }` }
					href={ cdn + `/i/favicons/apple-touch-icon-${ size }x${ size }.png` }
				/>
			) ) }

			<link rel="profile" href="http://gmpg.org/xfn/11" />

			{ ! branchName || 'master' === branchName ? (
				<link rel="manifest" href="/calypso/manifest.json" />
			) : (
				<link
					rel="manifest"
					href={ '/calypso/manifest.json?branch=' + encodeURIComponent( branchName ) }
				/>
			) }
			<link
				rel="preload"
				href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese&display=swap"
				as="style"
			/>
			<noscript>
				<link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese&display=swap"
				/>
			</noscript>
			{ /* eslint-disable react/no-danger */ }
			<script
				type="text/javascript"
				nonce={ inlineScriptNonce }
				dangerouslySetInnerHTML={ {
					// eslint-disable
					__html: `
			(function() {
				var m = document.createElement( "link" );
				m.rel = "stylesheet";
				m.href = "https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese&display=swap";
				document.head.insertBefore( m, document.head.childNodes[ document.head.childNodes.length - 1 ].nextSibling );
			})()
			`,
				} }
			/>
			{ /* eslint-enable react/no-danger */ }
			{ children }
		</head>
	);
};

Head.propTypes = {
	title: PropTypes.string,
	faviconURL: PropTypes.string.isRequired,
	children: PropTypes.node,
	cdn: PropTypes.string.isRequired,
	branchName: PropTypes.string,
};

export default Head;
