/**
 * External dependencies
 */
import React from 'react';

const NotFoundError = ( { urls: { 'style.css': styleCss } } ) => (
	<html lang="en">
		<head>
			<title>WordPress.com</title>
			<meta charSet="utf-8" />
			<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
			<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
			<meta name="fomat-detection" content="telephone=no" />
			<meta name="mobile-web-app-capable" content="yes" />
			<link rel="shortcut icon" type="image/vnd.microsoft.icon" href="//s1.wp.com/i/favicon.ico" sizes="16x16 32x32 48x48" />
			<link rel="shortcut icon" type="image/x-icon" href="//s1.wp.com/i/favicon.ico" sizes="16x16" />
			<link rel="icon" type="image/x-icon" href="//s1.wp.com/i/favicon.ico" sizes="16x16" />
			<link rel="profile" href="http://gmpg.org/xfn/11" />
			<link rel="stylesheet" href="//s1.wp.com/i/fonts/merriweather/merriweather.css?v=20160210" />
			<link rel="stylesheet" href="//s1.wp.com/i/noticons/noticons.css?v=20150727" />
			<link rel="stylesheet" href={ styleCss } />
		</head>
		<body>
			<div id="wpcom" className="wpcom-site">
				<div className="layout has-no-sidebar">
					<div id="content" className="layout__content">
						<div id="primary" className="layout__primary">
							<div className="empty-content">
								<img className="empty-content__illustration"
									src="/calypso/images/drake/drake-404.svg" />
								<h2 className="empty-content__title">Uh oh. Page not found</h2>
								<h3 className="empty-content__line">Sorry, the page you were looking for doesn't exist or has been moved</h3>
								<a className="empty-content__action button button-primary" href="/">Go back home</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</body>
	</html>
);

export default NotFoundError;
