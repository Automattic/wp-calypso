/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import classNames from 'classnames';
import getStylesheetUrl from './utils/stylesheet';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';

class Browsehappy extends React.Component {
	render() {
		const {
			faviconUrl,
			head,
			isRtl,
			lang,
			isFluidWidth,
			dashboardUrl,
			urls,
			env,
			isDebug,
		} = this.props;

		return (
			<html
				lang={ lang }
				dir={ isRtl ? 'rtl' : 'ltr' }
				className={ classNames( { 'is-fluid-width': isFluidWidth } ) }
			>
				<head>
					<title>{ 'Unsupported Browser - WordPress.com' }</title>
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
					<meta name="format-detection" content="telephone=no" />
					<meta name="mobile-web-app-capable" content="yes" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta name="referrer" content="origin" />

					<link
						rel="shortcut icon"
						type="image/vnd.microsoft.icon"
						href={ faviconUrl }
						sizes="16x16 32x32"
					/>
					<link rel="shortcut icon" type="image/x-icon" href={ faviconUrl } sizes="16x16 32x32" />
					<link rel="icon" type="image/x-icon" href={ faviconUrl } sizes="16x16 32x32" />
					<link
						rel="icon"
						type="image/png"
						href="//s1.wp.com/i/favicons/favicon-64x64.png"
						sizes="64x64"
					/>
					<link
						rel="icon"
						type="image/png"
						href="//s1.wp.com/i/favicons/favicon-96x96.png"
						sizes="96x96"
					/>
					<link
						rel="icon"
						type="image/png"
						href="//s1.wp.com/i/favicons/android-chrome-192x192.png"
						sizes="192x192"
					/>
					<link
						rel="apple-touch-icon"
						sizes="57x57"
						href="//s1.wp.com/i/favicons/apple-touch-icon-57x57.png"
					/>
					<link
						rel="apple-touch-icon"
						sizes="60x60"
						href="//s1.wp.com/i/favicons/apple-touch-icon-60x60.png"
					/>
					<link
						rel="apple-touch-icon"
						sizes="72x72"
						href="//s1.wp.com/i/favicons/apple-touch-icon-72x72.png"
					/>
					<link
						rel="apple-touch-icon"
						sizes="76x76"
						href="//s1.wp.com/i/favicons/apple-touch-icon-76x76.png"
					/>
					<link
						rel="apple-touch-icon"
						sizes="114x114"
						href="//s1.wp.com/i/favicons/apple-touch-icon-114x114.png"
					/>
					<link
						rel="apple-touch-icon"
						sizes="120x120"
						href="//s1.wp.com/i/favicons/apple-touch-icon-120x120.png"
					/>
					<link
						rel="apple-touch-icon"
						sizes="144x144"
						href="//s1.wp.com/i/favicons/apple-touch-icon-144x144.png"
					/>
					<link
						rel="apple-touch-icon"
						sizes="152x152"
						href="//s1.wp.com/i/favicons/apple-touch-icon-152x152.png"
					/>
					<link
						rel="apple-touch-icon"
						sizes="180x180"
						href="//s1.wp.com/i/favicons/apple-touch-icon-180x180.png"
					/>
					<link rel="profile" href="http://gmpg.org/xfn/11" />
					<link rel="manifest" href="/calypso/manifest.json" />
					<link
						rel="stylesheet"
						/* eslint-disable max-len */
						href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese"
						/* eslint-enable max-len */
					/>
					<link rel="stylesheet" href="//s1.wp.com/i/noticons/noticons.css?v=20150727" />
					<link rel="stylesheet" href={ getStylesheetUrl( { urls, isRtl, env, isDebug } ) } />
				</head>
				<body className={ isRtl ? 'rtl' : null }>
					{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
					<div id="wpcom" className="wpcom-site">
						<div className="layout has-no-sidebar">
							<div id="content" className="layout__content">
								<div id="primary" className="layout__primary">
									<main className="browsehappy__main main" role="main">
										<EmptyContent
											title="Unsupported Browser"
											line={ [
												'Unfortunately this page cannot be used by your browser. You can either ',
												<a href={ dashboardUrl }>use the classic WordPress dashboard</a>,
												' or ',
												<a href="https://browsehappy.com">upgrade your browser</a>,
												'.',
											] }
											illustration="/calypso/images/drake/drake-browser.svg"
										/>
									</main>
								</div>
							</div>
						</div>
					</div>
					{ /* eslint-enable wpcalypso/jsx-classname-namespace */ }
				</body>
			</html>
		);
	}
}

export default Browsehappy;
