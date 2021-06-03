import React from 'react';
import EmptyContent from 'calypso/components/empty-content';
import Head from 'calypso/components/head';
import { chunkCssLinks } from './utils';

function Browsehappy( { entrypoint, dashboardUrl, bypassUrl } ) {
	const bypassLink = bypassUrl ? (
		<p>
			Alternatively you can{ ' ' }
			<a key="bypass-link" href={ bypassUrl }>
				continue loading the page
			</a>{ ' ' }
			but some features may not work as expected.
		</p>
	) : null;

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
										line={
											<>
												<p>
													Unfortunately this page cannot be used by your browser. You can either{ ' ' }
													<a key="dashboard-link" href={ dashboardUrl }>
														use the classic WordPress dashboard
													</a>
													, or{ ' ' }
													<a key="browsehappy-link" href="https://browsehappy.com">
														upgrade your browser
													</a>
													.
												</p>
												{ bypassLink }
											</>
										}
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
