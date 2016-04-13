/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import sanitize from 'sanitize';

class Application extends React.Component {
	getStylesheet() {
		let stylesheet = 'style.css';

		if ( this.props.isRTL ) {
			stylesheet = 'style-rtl.css';
		} else if ( 'development' === this.props.env || this.props.isDebug ) {
			stylesheet = 'style-debug.css';
		}

		return this.props.urls[ stylesheet ];
	}

	renderBadge() {
		return (
			<div className="environment-badge">
				<a href={ this.props.feedbackURL } title="Report an issue" target="_blank" className="bug-report" />
				<span className={ 'environment is-' + this.props.badge }>
					{ this.props.badge }
				</span>
			</div>
		);
	}

	render() {
		return (
			<html lang={ this.props.lang }
				dir={ this.props.isRTL ? 'rtl' : 'ltr' }
				className={ this.props.isFluidWidth ? 'is-fluid-with' : null }>
				<head>
					<title>WordPress.com</title>
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
					<meta name="fomat-detection" content="telephone=no" />
					<meta name="mobile-web-app-capable" content="yes" />
					<link rel="shortcut icon" type="image/vnd.microsoft.icon" href={ this.props.faviconURL } sizes="16x16 32x32 48x48" />
					<link rel="shortcut icon" type="image/x-icon" href={ this.props.faviconURL } sizes="16x16" />
					<link rel="icon" type="image/x-icon" href={ this.props.faviconURL } sizes="16x16" />
					<link rel="profile" href="http://gmpg.org/xfn/11" />
					<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,400,300,600|Merriweather:700,400,700italic,400italic" />
					<link rel="stylesheet" href="https://s1.wp.com/i/noticons/noticons.css?v=20150727" />
					<link rel="stylesheet" href="https://s1.wp.com/wp-includes/css/dashicons.css?v=20150727" />
					<link rel="stylesheet" href={ this.getStylesheet() } />
					<link rel="stylesheet" href="/desktop/wordpress-desktop.css" />
					<script src="/desktop/desktop-app.js" />
				</head>
				<body className={ this.props.isRTL ? 'rtl' : null }>
					<div id="wpcom" className="wpcom-site">
					</div>
					{ this.props.badge ? this.renderBadge() : null }

					{ this.props.app &&
						<script type="text/javascript"
							dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
								'var app = ' + sanitize.jsonStringifyForHtml( this.props.app )
							} } />
					}
					{ this.props.i18nLocaleScript &&
						<script src={ this.props.i18nLocaleScript } />
					}
					<script type="text/javascript" dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
						'startApp();'
					} } />
				</body>
			</html>
		);
	}
};

export default Application;
