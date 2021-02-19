/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Head from 'calypso/components/head';
import EmptyContent from 'calypso/components/empty-content';
import { chunkCssLinks } from './utils';

function Browsehappy( { entrypoint, dashboardUrl } ) {
	return (
		<html lang="en">
			<Head title="Unsupported Browser — WordPress.com">{ chunkCssLinks( entrypoint ) }</Head>
			<body>
				{ /* eslint-disable wpcalypso/jsx-classname-namespace*/ }
				<div id="wpcom" className="wpcom-site">
					<div className="layout has-no-sidebar">
						<div className="layout__content" id="content">
							<div className="layout__primary" id="primary">
								<main className="browsehappy__main main" role="main">
									<EmptyContent
										illustration="/calypso/images/drake/drake-browser.svg"
										title="Unsupported Browser"
										line={ [
											'Unfortunately this page cannot be used by your browser. You can either ',
											<a key="dashboard-link" href={ dashboardUrl }>
												use the classic WordPress dashboard
											</a>,
											', or ',
											<a key="browsehappy-link" href="https://browsehappy.com">
												upgrade your browser
											</a>,
											'.',
										] }
									/>
								</main>
							</div>
						</div>
					</div>
				</div>
				{ /* eslint-enable wpcalypso/jsx-classname-namespace*/ }
			</body>
		</html>
	);
}

export default Browsehappy;
