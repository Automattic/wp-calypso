/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */

const Head = ( { title = 'WordPress.com', faviconURL, children, cdn } ) => {
	return (
		<head>
			<title>{ title }</title>

			<meta charSet="utf-8" />
			<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			<meta name="format-detection" content="telephone=no" />
			<meta name="mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="referrer" content="origin" />

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
			<link
				rel="apple-touch-icon"
				sizes="57x57"
				href={ cdn + '/i/favicons/apple-touch-icon-57x57.png' }
			/>
			<link
				rel="apple-touch-icon"
				sizes="60x60"
				href={ cdn + '/i/favicons/apple-touch-icon-60x60.png' }
			/>
			<link
				rel="apple-touch-icon"
				sizes="72x72"
				href={ cdn + '/i/favicons/apple-touch-icon-72x72.png' }
			/>
			<link
				rel="apple-touch-icon"
				sizes="76x76"
				href={ cdn + '/i/favicons/apple-touch-icon-76x76.png' }
			/>
			<link
				rel="apple-touch-icon"
				sizes="114x114"
				href={ cdn + '/i/favicons/apple-touch-icon-114x114.png' }
			/>
			<link
				rel="apple-touch-icon"
				sizes="120x120"
				href={ cdn + '/i/favicons/apple-touch-icon-120x120.png' }
			/>
			<link
				rel="apple-touch-icon"
				sizes="144x144"
				href={ cdn + '/i/favicons/apple-touch-icon-144x144.png' }
			/>
			<link
				rel="apple-touch-icon"
				sizes="152x152"
				href={ cdn + '/i/favicons/apple-touch-icon-152x152.png' }
			/>
			<link
				rel="apple-touch-icon"
				sizes="180x180"
				href={ cdn + '/i/favicons/apple-touch-icon-180x180.png' }
			/>

			<link rel="profile" href="http://gmpg.org/xfn/11" />
			<link rel="manifest" href="/calypso/manifest.json" />

			<link
				rel="stylesheet"
				/* eslint-disable max-len */
				href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese"
				/* eslint-disable max-len */
			/>
			<link
				rel="stylesheet"
				id="noticons-css"
				href={ cdn + '/i/noticons/noticons.css?v=20150727' }
			/>

			{ children }
		</head>
	);
};

Head.propTypes = {
	title: PropTypes.string,
	faviconURL: PropTypes.string.isRequired,
	children: PropTypes.node,
	cdn: PropTypes.string.isRequired,
};

export default Head;
