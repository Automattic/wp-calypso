/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Head from '../components/head';
import EmptyContent from 'components/empty-content';
import getStylesheet from './utils/stylesheet';

function Browsehappy( {
	urls,
	faviconURL,
	isRTL,
	isDebug,
	env,
	lang,
	isFluidWidth,
	dashboardUrl,
} ) {
	return (
		<html
			lang={ lang }
			dir={ isRTL ? 'rtl' : 'ltr' }
			className={ classNames( { 'is-fluid-width': isFluidWidth } ) }
		>
			<Head
				title="Unsupported Browser — WordPress.com"
				faviconURL={ faviconURL }
				cdn={ '//s1.wp.com' }
			>
				<link
					rel="stylesheet"
					id="main-css"
					href={
						urls[ getStylesheet( { rtl: !! isRTL, debug: isDebug || env === 'development' } ) ]
					}
					type="text/css"
				/>
			</Head>
			<body className={ classNames( { rlt: isRTL } ) }>
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
