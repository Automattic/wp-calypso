/**
 * External dependencies
 */
import React from 'react';

const Head = ( { children, stylesheetUrl, title = 'WordPress.com', faviconUrl = '//s1.wp.com/i/favicon.ico' } ) => (
	<head>
		<title>{ title }</title>
		<meta charSet="utf-8" />
		<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
		<meta name="format-detection" content="telephone=no" />
		<meta name="mobile-web-app-capable" content="yes" />
		<link rel="shortcut icon" type="image/vnd.microsoft.icon" href={ faviconUrl } sizes="16x16 32x32" />
		<link rel="shortcut icon" type="image/x-icon" href={ faviconUrl } sizes="16x16 32x32" />
		<link rel="icon" type="image/x-icon" href={ faviconUrl } sizes="16x16 32x32" />
		<link rel="icon" type="image/png" href="//s1.wp.com/i/favicons/favicon-64x64.png" sizes="64x64" />
		<link rel="icon" type="image/png" href="//s1.wp.com/i/favicons/favicon-96x96.png" sizes="96x96" />
		<link rel="icon" type="image/png" href="//s1.wp.com/i/favicons/android-chrome-192x192.png" sizes="192x192" />
		<link rel="apple-touch-icon" sizes="57x57" href="//s1.wp.com/i/favicons/apple-touch-icon-57x57.png" />
		<link rel="apple-touch-icon" sizes="60x60" href="//s1.wp.com/i/favicons/apple-touch-icon-60x60.png" />
		<link rel="apple-touch-icon" sizes="72x72" href="//s1.wp.com/i/favicons/apple-touch-icon-72x72.png" />
		<link rel="apple-touch-icon" sizes="76x76" href="//s1.wp.com/i/favicons/apple-touch-icon-76x76.png" />
		<link rel="apple-touch-icon" sizes="114x114" href="//s1.wp.com/i/favicons/apple-touch-icon-114x114.png" />
		<link rel="apple-touch-icon" sizes="120x120" href="//s1.wp.com/i/favicons/apple-touch-icon-120x120.png" />
		<link rel="apple-touch-icon" sizes="144x144" href="//s1.wp.com/i/favicons/apple-touch-icon-144x144.png" />
		<link rel="apple-touch-icon" sizes="152x152" href="//s1.wp.com/i/favicons/apple-touch-icon-152x152.png" />
		<link rel="apple-touch-icon" sizes="180x180" href="//s1.wp.com/i/favicons/apple-touch-icon-180x180.png" />
		<link rel="profile" href="http://gmpg.org/xfn/11" />
		<link rel="stylesheet" href="//s1.wp.com/i/fonts/merriweather/merriweather.css?v=20160210" />
		<link rel="stylesheet" href="//s1.wp.com/i/noticons/noticons.css?v=20150727" />
		<link rel="stylesheet" href="//s1.wp.com/wp-includes/css/dashicons.css?v=20150727" />
		<link rel="stylesheet" href={ stylesheetUrl } />
		{ children }
	</head>
);

export default Head;
