/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { jsonStringifyForHtml } from 'sanitize';
import Head from './head';
import Badge from './badge';

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

	render() {
		const {
			app,
			badge,
			faviconURL: faviconUrl,
			i18nLocaleScript,
			isFluidWidth,
			isRTL,
			lang,
		} = this.props;

		return (
			<html lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ classNames( 'is-desktop', { 'is-fluid-with': isFluidWidth } ) }>
				<Head title="WordPress.com" faviconUrl={ faviconUrl } styleCss={ this.getStylesheet() }>
					<link rel="stylesheet" href="/desktop/wordpress-desktop.css" />
					<script src="/calypso/build.js" />
					<script src="/desktop/desktop-app.js" />
				</Head>
				<body className={ isRTL ? 'rtl' : null }>
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
