/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import { jsonStringifyForHtml } from 'sanitize';
import Head from './head';
import Badge from './badge';

class Desktop extends React.Component {
	getStylesheet() {
		const { isDebug, urls } = this.props;
		let stylesheet = 'style.css';

		if ( config( 'rtl' ) ) {
			stylesheet = 'style-rtl.css';
		} else if ( config( 'env' ) === 'development' || isDebug ) {
			stylesheet = 'style-debug.css';
		}

		return urls[ stylesheet ];
	}

	render() {
		const {
			app,
			badge,
			faviconURL: faviconUrl,
			i18nLocaleScript,
			lang,
		} = this.props;

		return (
			<html lang={ lang }
				dir={ config( 'rtl' ) ? 'rtl' : 'ltr' }
				className={ classNames( 'is-desktop', { 'is-fluid-with': !! config.isEnabled( 'fluid-width' ) } ) }>
				<Head title="WordPress.com" faviconUrl={ faviconUrl } styleCss={ this.getStylesheet() }>
					<link rel="stylesheet" href="/desktop/wordpress-desktop.css" />
					<script src="/calypso/build.js" />
					<script src="/desktop/desktop-app.js" />
				</Head>
				<body className={ config( 'rtl' ) ? 'rtl' : null }>
					<div id="wpcom" className="wpcom-site">
						<div className="wpcom-site__logo noticon noticon-wordpress" />
					</div>
					{ badge && <Badge { ...this.props } /> }

					{ app &&
						<script type="text/javascript"
							dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
								'var app = ' + jsonStringifyForHtml( app )
							} } />
					}
					{ i18nLocaleScript &&
						<script src={ i18nLocaleScript } />
					}
					<script>
						startApp();
					</script>
				</body>
			</html>
		);
	}
}

export default Desktop;
