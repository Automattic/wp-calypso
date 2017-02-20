/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import { jsonStringifyForHtml } from 'sanitize';
import Head from 'components/head';
import Badge from 'components/badge';

class Document extends React.Component {
	getStylesheetUrl() {
		const { isDebug, isRtl, urls } = this.props;
		let stylesheet = 'style.css';

		if ( isRtl ) {
			stylesheet = 'style-rtl.css';
		} else if ( config( 'env' ) === 'development' || isDebug ) {
			stylesheet = 'style-debug.css';
		}

		return urls[ stylesheet ];
	}

	render() {
		const {
			app,
			catchJsErrors,
			chunk,
			head,
			i18nLocaleScript,
			initialReduxState,
			isDebug,
			isRtl,
			jsFile,
			lang,
			renderedLayout,
			user,
			urls
		} = this.props;
		const scriptSuffix = ( config( 'env' ) === 'development' || isDebug ) ? '' : '-min';

		return (
			<html lang={ lang }
				dir={ isRtl ? 'rtl' : 'ltr' }
				className={ classNames( { 'is-fluid-with': !! config.isEnabled( 'fluid-width' ) } ) }>
				<Head title={ head.title } stylesheetUrl={ this.getStylesheetUrl() }>
					{ head.metas.map( ( { name, property, content }, i ) => (
						<meta name={ name } property={ property } content={ content } key={ 'meta-' + i } />
					) ) }
					{ head.links.map( ( { rel, href }, i ) => (
						<link rel={ rel } href={ href } key={ 'link-' + i } />
					) ) }
				</Head>
				<body className={ isRtl ? 'rtl' : null }>
					{ renderedLayout
						? <div id="wpcom" className="wpcom-site" dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
							renderedLayout
						} } />
						: <div id="wpcom" className="wpcom-site">
							<div className="wpcom-site__logo noticon noticon-wordpress" />
						</div>
					}
					<Badge />

					{ config( 'env' ) !== 'development' &&
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
					<script src={ urls[ 'manifest' + scriptSuffix ] } />
					<script src={ urls[ 'vendor' + scriptSuffix ] } />
					<script src={ urls[ `${ jsFile }-${ config( 'env' ) }${ scriptSuffix }` ] } />
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

export default Document;
