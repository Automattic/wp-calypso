/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { jsonStringifyForHtml } from 'sanitize';

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

	renderBranchName() {
		const { branchName, commitChecksum } = this.props;
		return (
			<span className={ 'environment branch-name' } title={ 'Commit ' + commitChecksum }>
				{ branchName }
			</span>
		);
	}

	renderDevDocsLink() {
		const { devDocsURL, docs } = this.props;
		return (
			<span className="environment is-docs">
				<a href={ devDocsURL } title="DevDocs">
					{ docs }
				</a>
			</span>
		);
	}

	renderBadge() {
		const { abTestHelper, badge, branchName, feedbackURL, devDocs } = this.props;
		return (
			<div className="environment-badge">
				{ abTestHelper && <div className="environment is-tests" /> }
				{ branchName && branchName !== 'master' && this.renderBranchName() }
				{ devDocs && this.renderDevDocsLink() }
				<span className={ 'environment is-' + badge }>
					{ badge }
				</span>
				<a href={ feedbackURL } title="Report an issue" target="_blank" rel="noopener noreferrer" className="bug-report" />
			</div>
		);
	}

	render() {
		const {
			app,
			badge,
			catchJsErrors,
			chunk,
			env,
			faviconURL,
			head,
			i18nLocaleScript,
			initialReduxState,
			isDebug,
			isFluidWidth,
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
				className={ isFluidWidth ? 'is-fluid-with' : null }>
				<head>
					<title>{ head.title }</title>
					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
					<meta name="fomat-detection" content="telephone=no" />
					<meta name="mobile-web-app-capable" content="yes" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta name="referrer" content="origin" />
					{ head.metas.map( ( { name, property, content } ) => (
						<meta name={ name } property={ property } content={ content } />
					) ) }
					{ head.links.map( ( { rel, href } ) => (
						<link rel={ rel } href={ href } />
					) ) }
					<link rel="shortcut icon" type="image/vnd.microsoft.icon" href={ faviconURL } sizes="16x16 32x32" />
					<link rel="shortcut icon" type="image/x-icon" href={ faviconURL } sizes="16x16 32x32" />
					<link rel="icon" type="image/x-icon" href={ faviconURL } sizes="16x16 32x32" />
					<link rel="icon" type="image/png" href="//s1.wp.com/i/favicons/favicon-64x64.png" sizes="64x64" />
					<link rel="icon" type="image/png" href="//s1.wp.com/i/favicons/favicon-96x96.png" sizes="96x96" />
					<link rel="icon" type="image/png" href="//s1.wp.com/i/favicons/android-chrome-192x192.png" sizes="192x192" />
					<link rel="apple-touch-icon" sizes="57x57" href="//s1.wp.com/i/favicons/apple-touch-icon-57x57.png" />
					<link rel="apple-touch-icon" sizes="60x60" href="//s1.wp.com/i/favicons/apple-touch-icon-60x60.png" />
					<link rel="apple-touch-icon" sizes="72x72" href="//s1.wp.com/i/favicons/apple-touch-icon-72x72.png" />
					<link rel="apple-touch-icon" sizes="76x76" href="//s1.wp.com/i/favicons/apple-touch-icon-76x76.png" />
					<link rel="apple-touch-icon" sizes="114x114" href="//s1.wp.com/i/favicons/apple-touch-icon-114x114.png" />
					<link rel="apple-touch-icon" sizes="120x120" href="//s1.wp.com/i/favicons/apple-touch-icon-120x120.png" />
					<link rel="apple-touch-icon" sizes="144x144" href="//s1.wp.com/i/favicons/apple-touch-icon-144x144.png" />
					<link rel="apple-touch-icon" sizes="152x152" href="//s1.wp.com/i/favicons/apple-touch-icon-152x152.png" />
					<link rel="apple-touch-icon" sizes="180x180" href="//s1.wp.com/i/favicons/apple-touch-icon-180x180.png" />
					<link rel="profile" href="http://gmpg.org/xfn/11" />
					<link rel="manifest" href="/calypso/manifest.json" />
					<link rel="stylesheet" href="//s1.wp.com/i/fonts/merriweather/merriweather.css?v=20160210" />
					<link rel="stylesheet" href="//s1.wp.com/i/noticons/noticons.css?v=20150727" />
					<link rel="stylesheet" href="//s1.wp.com/wp-includes/css/dashicons.css?v=20150727" />
					<link rel="stylesheet" href={ this.getStylesheet() } />
				</head>
				<body className={ isRTL ? 'rtl' : null }>
					{ renderedLayout
						? <div id="wpcom" className="wpcom-site" dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
							renderedLayout
						} } />
						: <div id="wpcom" className="wpcom-site">
							<div className="wpcom-site__logo noticon noticon-wordpress" />
						</div>
					}
					{ badge && this.renderBadge() }

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
					<script type="text/javascript" dangerouslySetInnerHTML={ { __html: // eslint-disable-line react/no-danger
						'window.AppBoot();'
					} } />
					<noscript className="wpcom-site__global-noscript">
						Please enable JavaScript in your browser to enjoy WordPress.com.
					</noscript>
				</body>
			</html>
		);
	}
}

export default Markup;
