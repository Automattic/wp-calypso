/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Head from './components/head';

const NotFoundError = ( { urls: { 'style.css': stylesheetUrl } } ) => (
	<html lang="en">
		<Head stylesheetUrl={ stylesheetUrl } />
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
