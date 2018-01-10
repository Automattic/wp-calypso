/* eslint-disable react/no-danger */
/**
 * External dependencies
 *
 * @format
 */

import React, { Fragment } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { jsonStringifyForHtml } from 'sanitize';
import Masterbar from '../layout/masterbar/masterbar.jsx';
import getStylesheetUrl from './utils/stylesheet';
// import Badge from 'components/badge';

class Desktop extends React.Component {
	render() {
		const {
			app,
			faviconUrl,
			head,
			i18nLocaleScript,
			isRtl,
			lang,
			hasSecondary,
			config,
			isFluidWidth,
			urls,
			env,
			isDebug,
		} = this.props;

		return (
			<html
				lang={ lang }
				dir={ isRtl ? 'rtl' : 'ltr' }
				className={ classNames( 'is-desktop', { 'is-fluid-width': isFluidWidth } ) }
			>
				<head>
					<title>{ head.title || 'WordPress.com' }</title>
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
					<meta name="format-detection" content="telephone=no" />
					<meta name="mobile-web-app-capable" content="yes" />
					<link
						rel="shortcut icon"
						type="image/vnd.microsoft.icon"
						href={ faviconUrl }
						sizes="16x16 32x32"
					/>
					<link rel="shortcut icon" type="image/x-icon" href={ faviconUrl } sizes="16x16 32x32" />
					<link rel="icon" type="image/x-icon" href={ faviconUrl } sizes="16x16 32x32" />
					<link rel="profile" href="http://gmpg.org/xfn/11" />
					<link
						rel="stylesheet"
						/* eslint-disable max-len */
						href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese"
						/* eslint-disable max-len */
					/>
					<link rel="stylesheet" href="//s1.wp.com/i/noticons/noticons.css?v=20150727" />
					<link rel="stylesheet" href={ getStylesheetUrl( { urls, isRtl, env, isDebug } ) } />
					<link rel="stylesheet" href="/desktop/wordpress-desktop.css" />
				</head>
				<body className={ isRtl ? 'rtl' : null }>
					{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
					<div id="wpcom" className="wpcom-site">
						<div className="layout">
							<Masterbar />
							<div className="layout__content">
								<div className="wpcom-site__logo noticon noticon-wordpress" />
								{ hasSecondary && (
									<Fragment>
										<div className="layout__secondary" />
										<ul className="sidebar" />
									</Fragment>
								) }
							</div>
						</div>
					</div>
					{ /* <Badge /> */ }
					{ config && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								__html: config,
							} }
						/>
					) }
					<script src="/calypso/build.js" />
					<script src="/desktop/desktop-app.js" />
					{ app && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								__html: 'var app = ' + jsonStringifyForHtml( app ),
							} }
						/>
					) }
					{ i18nLocaleScript && <script src={ i18nLocaleScript } /> }
					<script>startApp();</script>
					{ /* eslint-enable wpcalypso/jsx-classname-namespace */ }
				</body>
			</html>
		);
	}
}

export default Desktop;
