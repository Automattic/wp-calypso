/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Head from './components/head';
import EmptyContent from 'components/empty-content';

const ServerError = ( { urls: { 'style.css': stylesheetUrl } } ) => (
	<html lang="en">
		<Head stylesheetUrl={ stylesheetUrl } />
		<body>
			<div id="wpcom" className="wpcom-site">
				<div className="layout has-no-sidebar">
					<div id="content" className="layout__content">
						<div id="primary" className="layout__primary">
							<EmptyContent title="We're sorry, but an unexpected error has occurred"
								illustration="/calypso/images/drake/drake-500.svg" />
						</div>
					</div>
				</div>
			</div>
		</body>
	</html>
);

export default ServerError;
