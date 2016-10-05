/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import config from 'config';
import { jsonStringifyForHtml } from 'sanitize';
import Head from './head';
import Badge from './badge';

class Markup extends React.Component {
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
			catchJsErrors,
			chunk,
			env,
			faviconURL: faviconUrl,
			head,
			i18nLocaleScript,
			initialReduxState,
			isDebug,
			isRTL,
			jsFile,
			lang,
			renderedLayout,
			user,
			urls
		} = this.props;
		const scriptSuffix = ( 'development' === env || isDebug ) ? '' : '-min';

		return (
			<html lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ !! config.isEnabled( 'fluid-width' ) ? 'is-fluid-with' : null }>
				<Head title={ head.title } faviconUrl={ faviconUrl } styleCss={ this.getStylesheet() }>
					{ head.metas.map( ( { name, property, content } ) => (
						<meta name={ name } property={ property } content={ content } />
					) ) }
					{ head.links.map( ( { rel, href } ) => (
						<link rel={ rel } href={ href } />
					) ) }
				</Head>
				<body className={ isRTL ? 'rtl' : null }>
					{ renderedLayout
						? <div id="wpcom" className="wpcom-site" dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
							renderedLayout
						} } />
						: <div id="wpcom" className="wpcom-site">
							<div className="wpcom-site__logo noticon noticon-wordpress" />
						</div>
					}
					{ badge && <Badge { ...this.props } /> }

					{ 'development' !== env &&
						<script src={ catchJsErrors } />
					}

					{ user &&
						<script type="text/javascript"
							dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
								'var currentUser = ' + jsonStringifyForHtml( user )
							} } />
					}
					{ app &&
						<script type="text/javascript"
							dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
								'var app = ' + jsonStringifyForHtml( app )
							} } />
					}
					{ initialReduxState &&
						<script type="text/javascript"
							dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
								'var initialReduxState = ' + jsonStringifyForHtml( initialReduxState )
							} } />
					}
					{ i18nLocaleScript &&
						<script src={ i18nLocaleScript } />
					}
					<script src={ urls[ 'vendor' + scriptSuffix ] } />
					<script src={ urls[ `${ jsFile }-${ env }${ scriptSuffix }` ] } />
					{ chunk &&
						<script src={ urls[ '_commons' + scriptSuffix ] } />
					}
					{ chunk &&
						<script src={ urls[ chunk + scriptSuffix ] } />
					}
					<script>
						window.AppBoot();
					</script>
					<noscript className="wpcom-site__global-noscript">
						Please enable JavaScript in your browser to enjoy WordPress.com.
					</noscript>
				</body>
			</html>
		);
	}
}

export default Markup;
