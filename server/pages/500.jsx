/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Head from './head';

const ServerError = ( { urls: { 'style.css': stylesheetUrl } } ) => (
	<html lang="en">
		<Head stylesheetUrl={ stylesheetUrl } />
		<body>
			<div id="wpcom" className="wpcom-site">
				<div className="layout has-no-sidebar">
					<div id="content" className="layout__content">
						<div id="primary" className="layout__primary">
							<div className="empty-content">
								<img className="empty-content__illustration"
									src="/calypso/images/drake/drake-500.svg" />
								<h2 className="empty-content__title">We're sorry, but an unexpected error has occurred</h2>
							</div>
						</div>
					</div>
				</div>
			</div>
		</body>
	</html>
);

export default ServerError;
