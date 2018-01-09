/* eslint-disable react/no-danger */
/**
 * External dependencies
 *
 * @format
 */

import React, { Fragment } from 'react';
import classNames from 'classnames';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import { jsonStringifyForHtml } from '../../server/sanitize';
import Masterbar from '../layout/masterbar/masterbar.jsx';
import getStylesheetUrl from './utils/stylesheet';
// import Badge from 'components/badge';

class Document extends React.Component {
	render() {
		const {
			app,
			chunk,
			faviconUrl,
			head,
			i18nLocaleScript,
			initialReduxState,
			isRtl,
			jsFile,
			lang,
			renderedLayout,
			user,
			urls,
			hasSecondary,
			sectionGroup,
			config,
			isFluidWidth,
			shouldUseSingleCDN,
			shouldUsePreconnect,
			shouldUsePreconnectGoogle,
			shouldUseStylePreloadExternal,
			shouldUseStylePreloadSection,
			shouldUseStylePreloadCommon,
			shouldUseScriptPreload,
			sectionCss,
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
					<title>{ head.title || 'WordPress.com' }</title>

					<meta charSet="utf-8" />
					<meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
					<meta name="format-detection" content="telephone=no" />
					<meta name="mobile-web-app-capable" content="yes" />
					<meta name="apple-mobile-web-app-capable" content="yes" />
					<meta name="referrer" content="origin" />

					{ head.metas.map( ( { name, property, content } ) => (
						<meta name={ name } property={ property } content={ content } key={ 'meta-' + name } />
					) ) }

					{ head.links.map( ( { rel, href } ) => (
						<link rel={ rel } href={ href } key={ 'link-' + rel + href } />
					) ) }

					<link
						rel="shortcut icon"
						type="image/vnd.microsoft.icon"
						href={ faviconUrl }
						sizes="16x16 32x32"
					/>
					<link rel="shortcut icon" type="image/x-icon" href={ faviconUrl } sizes="16x16 32x32" />
					<link rel="icon" type="image/x-icon" href={ faviconUrl } sizes="16x16 32x32" />

					{ shouldUseSingleCDN ? (
						<Fragment>
							<link
								rel="icon"
								type="image/png"
								href="//s0.wp.com/i/favicons/favicon-64x64.png"
								sizes="64x64"
							/>
							<link
								rel="icon"
								type="image/png"
								href="//s0.wp.com/i/favicons/favicon-96x96.png"
								sizes="96x96"
							/>
							<link
								rel="icon"
								type="image/png"
								href="//s0.wp.com/i/favicons/android-chrome-192x192.png"
								sizes="192x192"
							/>
							<link
								rel="apple-touch-icon"
								sizes="57x57"
								href="//s0.wp.com/i/favicons/apple-touch-icon-57x57.png"
							/>
							<link
								rel="apple-touch-icon"
								sizes="60x60"
								href="//s0.wp.com/i/favicons/apple-touch-icon-60x60.png"
							/>
							<link
								rel="apple-touch-icon"
								sizes="72x72"
								href="//s0.wp.com/i/favicons/apple-touch-icon-72x72.png"
							/>
							<link
								rel="apple-touch-icon"
								sizes="76x76"
								href="//s0.wp.com/i/favicons/apple-touch-icon-76x76.png"
							/>
							<link
								rel="apple-touch-icon"
								sizes="114x114"
								href="//s0.wp.com/i/favicons/apple-touch-icon-114x114.png"
							/>
							<link
								rel="apple-touch-icon"
								sizes="120x120"
								href="//s0.wp.com/i/favicons/apple-touch-icon-120x120.png"
							/>
							<link
								rel="apple-touch-icon"
								sizes="144x144"
								href="//s0.wp.com/i/favicons/apple-touch-icon-144x144.png"
							/>
							<link
								rel="apple-touch-icon"
								sizes="152x152"
								href="//s0.wp.com/i/favicons/apple-touch-icon-152x152.png"
							/>
							<link
								rel="apple-touch-icon"
								sizes="180x180"
								href="//s0.wp.com/i/favicons/apple-touch-icon-180x180.png"
							/>
						</Fragment>
					) : (
						<Fragment>
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
						</Fragment>
					) }

					<link rel="profile" href="http://gmpg.org/xfn/11" />
					<link rel="manifest" href="/calypso/manifest.json" />

					<link
						rel="stylesheet"
						href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese"
					/>

					{ shouldUseSingleCDN ? (
						<link
							key="noticons"
							rel="stylesheet"
							href="//s0.wp.com/i/noticons/noticons.css?v=20150727"
						/>
					) : (
						<link
							key="noticons"
							rel="stylesheet"
							href="//s1.wp.com/i/noticons/noticons.css?v=20150727"
						/>
					) }

					<link rel="stylesheet" id="main-css" href={ getStylesheetUrl( { urls, isRtl, env, isDebug } ) } />
					{ sectionCss && (
						<link
							rel="stylesheet"
							id={ 'section-css-' + sectionCss.id }
							href={ get( sectionCss, `urls.${ isRtl ? 'rtl' : 'ltr' }` ) }
						/>
					) }

					{ shouldUsePreconnect && (
						<Fragment>
							{ /*- Preconnect to our CDN hosts */ }
							{ shouldUseSingleCDN ? (
								<link rel="preconnect" href="//s0.wp.com" />
							) : (
								<link rel="preconnect" href="//s1.wp.com" />
							) }

							{ /*- Preconnect to our API */ }
							<link rel="preconnect" href="https://public-api.wordpress.com" />

							{ /*- Preconnect for analytics scripts. */ }
							<link rel="preconnect" href="//stats.wp.com" />
							<link rel="preconnect" href="https://www.google-analytics.com" />

							{ /*- Preconnect for Google domains - especially useful for SSO. */ }
							{ shouldUsePreconnectGoogle && [
								<link rel="preconnect" href="https://google.com" />,
								<link rel="preconnect" href="https://ssl.gstatic.com" />,
								<link rel="preconnect" href="https://apis.google.com" />,
								<link rel="preconnect" href="https://accounts.google.com" />,
								<link rel="preconnect" href="https://stats.g.doubleclick.net" />,
							] }
						</Fragment>
					) }

					{ shouldUseStylePreloadExternal && (
						<Fragment>
							<link
								rel="preload"
								as="style"
								href="https://fonts.googleapis.com/css?family=Noto+Serif:400,400i,700,700i&subset=cyrillic,cyrillic-ext,greek,greek-ext,latin-ext,vietnamese"
							/>
							<link
								rel="preload"
								as="style"
								href={ `//s${ shouldUseSingleCDN
									? '0'
									: '1' }.wp.com/i/noticons/noticons.css?v=20150727` }
							/>
						</Fragment>
					) }

					{ shouldUseStylePreloadSection &&
						sectionCss && (
							<link rel="preload" as="style" href={ sectionCss.urls[ isRtl ? 'rtl' : 'ltr' ] } />
						) }

					{ shouldUseStylePreloadCommon && (
						<link rel="preload" as="style" href={ this.getStylesheetUrl() } />
					) }

					{ shouldUseScriptPreload && (
						<Fragment>
							{ i18nLocaleScript && <link rel="preload" as="script" href={ i18nLocaleScript } /> }
							<link rel="preload" as="script" href={ urls.manifest } />
							<link rel="preload" as="script" href={ urls.vendor } />
							<link rel="preload" as="script" href={ urls[ jsFile ] } />
							{ chunk && <link rel="preload" as="script" href={ urls[ chunk ] } /> }
						</Fragment>
					) }
				</head>
				<body className={ classNames( { rtl: isRtl } ) }>
					{ renderedLayout ? (
						<div
							id="wpcom"
							className="wpcom-site"
							dangerouslySetInnerHTML={ {
								// eslint-disable-line react/no-danger
								__html: renderedLayout,
							} }
						/>
					) : (
						<div id="wpcom" className="wpcom-site">
							<div
								className={ classNames( 'layout', {
									[ 'is-group-' + sectionGroup ]: sectionGroup,
								} ) }
							>
								<Masterbar />
								<div className="layout__content">
									<div className="wpcom-site__logo noticon noticon-wordpress" />
									{ hasSecondary && (
										<Fragment>
											<div className="layout__secondary" />
											<ul className="sidebar" />
										</Fragment>
									) }
									{ sectionGroup === 'editor' && (
										<div className="card editor-ground-control">
											<div className="editor-ground-control__action-buttons" />
										</div>
									) }
								</div>
							</div>
						</div>
					) }
					{ /* <Badge /> */ }

					{ user && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								// eslint-disable-line react/no-danger
								__html: 'var currentUser = ' + jsonStringifyForHtml( user ),
							} }
						/>
					) }
					{ app && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								// eslint-disable-line react/no-danger
								__html: 'var app = ' + jsonStringifyForHtml( app ),
							} }
						/>
					) }
					{ initialReduxState && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								// eslint-disable-line react/no-danger
								__html: 'var initialReduxState = ' + jsonStringifyForHtml( initialReduxState ),
							} }
						/>
					) }
					{ config && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								// eslint-disable-line react/no-danger
								__html: config,
							} }
						/>
					) }
					{ i18nLocaleScript && <script src={ i18nLocaleScript } /> }
					<script src={ urls.manifest } />
					<script src={ urls.vendor } />
					<script src={ urls[ jsFile ] } />
					{ chunk && <script src={ urls[ chunk ] } /> }
					<script>window.AppBoot();</script>
					<noscript className="wpcom-site__global-noscript">
						Please enable JavaScript in your browser to enjoy WordPress.com.
					</noscript>
				</body>
			</html>
		);
	}
}

export default Document;
