/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Head from '../components/head';

class ServerError extends Component {
	render() {
		const { urls, faviconURL } = this.props;
		return (
			<html lang="en">
				<Head faviconURL={ faviconURL } cdn={ '//s1.wp.com' }>
					<link rel="stylesheet" id="main-css" href={ urls[ 'style.css' ] } type="text/css" />
				</Head>
				<body>
					{ /* eslint-disable wpcalypso/jsx-classname-namespace*/ }
					<div id="wpcom" className="wpcom-site">
						<div className="wp has-no-sidebar">
							<div className="layout__content" id="content">
								<div className="layout__primary" id="primary">
									<div className="empty-content">
										<img
											src="/calypso/images/illustrations/illustration-500.svg"
											alt="500 - Server error"
											className="empty-content__illustration"
										/>
										<h2 className="empty-content__title">
											We're sorry, but an unexpected error has occurred
										</h2>
									</div>
								</div>
							</div>
						</div>
					</div>
					{ /* eslint-enable wpcalypso/jsx-classname-namespace*/ }
				</body>
			</html>
		);
	}
}

export default ServerError;
