/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Head from './components/head';
import EmptyContent from 'components/empty-content';

const NotFoundError = ( { urls: { 'style.css': stylesheetUrl } } ) => (
	<html lang="en">
		<Head stylesheetUrl={ stylesheetUrl } />
		<body>
			<div id="wpcom" className="wpcom-site">
				<div className="layout has-no-sidebar">
					<div id="content" className="layout__content">
						<div id="primary" className="layout__primary">
							<EmptyContent title="Uh oh. Page not found"
								line="Sorry, the page you were looking for doesn't exist or has been moved"
								illustration="/calypso/images/drake/drake-404.svg"
								action="Go back home"
								actionURL="/" />
						</div>
					</div>
				</div>
			</div>
		</body>
	</html>
);

export default NotFoundError;
