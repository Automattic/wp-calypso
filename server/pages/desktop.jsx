/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { jsonStringifyForHtml } from 'sanitize';

class Desktop extends React.Component {
	getStylesheet() {
		const { env, isDebug, isRTL, urls } = this.props;
		let stylesheet = 'style.css';

		if ( isRTL ) {
			stylesheet = 'style-rtl.css';
		} else if ( 'development' === env || isDebug ) {
			stylesheet = 'style-debug.css';
		}

		return urls[ stylesheet ];
	}

	renderBadge() {
		const { badge, feedbackURL } = this.props;
		return (
			<div className="environment-badge">
				<a href={ feedbackURL } title="Report an issue" target="_blank" className="bug-report" />
				<span className={ 'environment is-' + badge }>
					{ badge }
				</span>
			</div>
		);
	}

	render() {
		const {
			app,
			badge,
			faviconURL,
			i18nLocaleScript,
			isFluidWidth,
			isRTL,
			lang,
		} = this.props;

		return (
			<html lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ classNames( 'is-desktop', { 'is-fluid-with': isFluidWidth } ) }>
				<head>
					<title>WordPress.com</title>
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
					<meta name="fomat-detection" content="telephone=no" />
					<meta name="mobile-web-app-capable" content="yes" />
					<link rel="shortcut icon" type="image/vnd.microsoft.icon" href={ faviconURL } sizes="16x16 32x32 48x48" />
					<link rel="shortcut icon" type="image/x-icon" href={ faviconURL } sizes="16x16" />
					<link rel="icon" type="image/x-icon" href={ faviconURL } sizes="16x16" />
					<link rel="profile" href="http://gmpg.org/xfn/11" />
					<link rel="stylesheet" href="https://s1.wp.com/i/fonts/merriweather/merriweather.css?v=20160210" />
					<link rel="stylesheet" href="https://s1.wp.com/i/noticons/noticons.css?v=20150727" />
					<link rel="stylesheet" href="https://s1.wp.com/wp-includes/css/dashicons.css?v=20150727" />
					<link rel="stylesheet" href={ this.getStylesheet() } />
					<link rel="stylesheet" href="/desktop/wordpress-desktop.css" />
					<script src="/calypso/build.js" />
					<script src="/desktop/desktop-app.js" />
				</head>
				<body className={ isRTL ? 'rtl' : null }>
					<div id="wpcom" className="wpcom-site">
						<div className="wpcom-site__logo noticon noticon-wordpress" />
					</div>
					{ badge ? this.renderBadge() : null }

					{ app &&
						<script type="text/javascript"
							dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
								'var app = ' + jsonStringifyForHtml( app )
							} } />
					}
					{ i18nLocaleScript &&
						<script src={ i18nLocaleScript } />
					}
					<script type="text/javascript" dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
						'startApp();'
					} } />
				</body>
			</html>
		);
	}
}

export default Desktop;
