/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
// import Head from './head.jsx';
import EmptyContent from 'components/empty-content';

const ServerError = ( { urls } ) => (
	<html lang="en">
		<head>
			<title>WordPress.com</title>
			<meta charSet="utf8" />
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			<meta name="format-detection" content="telephone=no" />
			<meta name="mobile-web-app-capable" content="yes" />
			<link rel="shortcut icon" type="image/vnd.microsoft.icon" href="//s1.wp.com/i/favicon.ico" sizes="16x16 32x32 48x48" />
			<link rel="shortcut icon" type="image/x-icon" href="//s1.wp.com/i/favicon.ico" sizes="16x16" />
			<link rel="icon" type="image/x-icon" href="//s1.wp.com/i/favicon.ico" sizes="16x16" />
			<link rel="profile" href="http://gmpg.org/xfn/11" />
			<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese" />
			<link rel="stylesheet" href="//s1.wp.com/i/noticons/noticons.css?v=20150727" />
			<link rel="stylesheet" href={ urls[ 'style.css' ] } />
		</head>
		<body>
			<div id="wpcom" className="wpcom-site">
				<div className="layout has-no-sidebar">
					<div id="content" className="layout__content">
						<div id="primary" className="layout__primary">
							<EmptyContent title="We're sorry, but an unexpected error has occurred"
								illustration="/calypso/images/illustrations/illustration-500.svg" />
						</div>
					</div>
				</div>
			</div>
		</body>
	</html>
);

export default ServerError;
