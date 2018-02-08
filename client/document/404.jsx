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

class NotFound extends Component {
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
						<div className="has-no-sidebar">
							<div className="layout__content" id="content">
								<div className="layout__primary" id="primary">
									<div className="empty-content">
										<img
											src="/calypso/images/illustrations/illustration-404.svg"
											alt="404 - Page not found"
											className="empty-content__illustration"
										/>
										<h2 className="empty-content__title">Uh oh. Page not found.</h2>
										<h3 className="empty-content__line">
											Sorry, the page you were looking for doesn't exist or has been moved.
										</h3>
										<a href="/" className="empty-content__action button button-primary">
											Return Home
										</a>
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

export default NotFound;
