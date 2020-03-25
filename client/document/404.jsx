/**
 * External dependencies
 *
 */

import React from 'react';
import classNames from 'classnames';
import config from 'config';

/**
 * Internal dependencies
 */
import Head from 'components/head';
import EmptyContent from 'components/empty-content';
import { chunkCssLinks } from './utils';

function NotFound( { faviconURL, entrypoint } ) {
	const theme = config( 'theme' );

	return (
		<html lang="en">
			<Head faviconURL={ faviconURL } cdn={ '//s1.wp.com' }>
				{ chunkCssLinks( entrypoint ) }
			</Head>
			<body
				className={ classNames( {
					[ 'theme-' + theme ]: theme,
				} ) }
			>
				{ /* eslint-disable wpcalypso/jsx-classname-namespace*/ }
				<div id="wpcom" className="wpcom-site">
					<div className="wp has-no-sidebar">
						<div className="layout__content" id="content">
							<div className="layout__primary" id="primary">
								<EmptyContent
									illustration="/calypso/images/illustrations/illustration-404.svg"
									title="Uh oh. Page not found."
									line="Sorry, the page you were looking for doesn't exist or has been moved."
									action="Return Home"
									actionURL="/"
								/>
							</div>
						</div>
					</div>
				</div>
				{ /* eslint-enable wpcalypso/jsx-classname-namespace*/ }
			</body>
		</html>
	);
}

export default NotFound;
