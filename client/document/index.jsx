/**
 * External dependencies
 *
 * @format
 */

import React, { Fragment } from 'react';
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { jsonStringifyForHtml } from '../../server/sanitize';
import Head from '../components/head';
import Masterbar from '../layout/masterbar/masterbar.jsx';
import getStylesheet from './utils/stylesheet';

class Document extends React.Component {
	render() {
		const {
			app,
			chunk,
			commitSha,
			faviconURL,
			head,
			i18nLocaleScript,
			initialReduxState,
			isRTL,
			jsFile,
			lang,
			renderedLayout,
			user,
			urls,
			hasSecondary,
			sectionGroup,
			config,
			isFluidWidth,
			sectionCss,
			env,
			isDebug,
			badge,
			abTestHelper,
			branchName,
			commitChecksum,
			devDocs,
			devDocsURL,
			feedbackURL,
		} = this.props;

		return (
			<html
				lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ classNames( { 'is-fluid-width': isFluidWidth } ) }
			>
				<Head title={ head.title } faviconURL={ faviconURL } cdn={ '//s1.wp.com' }>
					{ head.metas.map( props => <meta { ...props } /> ) }
					{ head.links.map( props => <link { ...props } /> ) }

					<link
						rel="stylesheet"
						id="main-css"
						href={
							urls[ getStylesheet( { rtl: !! isRTL, debug: isDebug || env === 'development' } ) ]
						}
						type="text/css"
					/>
					{ sectionCss && (
						<link
							rel="stylesheet"
							id={ 'section-css-' + sectionCss.id }
							href={ get( sectionCss, 'urls.' + ( isRTL ? 'rtl' : 'ltr' ) ) }
							type="text/css"
						/>
					) }
				</Head>
				<body className={ classNames( { rtl: isRTL } ) }>
					{ /* eslint-disable wpcalypso/jsx-classname-namespace, react/no-danger */ }
					{ renderedLayout ? (
						<div
							id="wpcom"
							className="wpcom-site"
							dangerouslySetInnerHTML={ {
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
					{ badge && (
						<div className="environment-badge">
							{ abTestHelper && <div className="environment is-tests" /> }
							{ branchName &&
								branchName !== 'master' && (
									<span className="environment branch-name" title={ 'Commit ' + commitChecksum }>
										{ branchName }
									</span>
								) }
							{ devDocs && (
								<span className="environment is-docs">
									<a href={ devDocsURL } title="DevDocs">
										docs
									</a>
								</span>
							) }
							<span className={ `environment is-${ badge } is-env` }>{ badge }</span>
							<a
								className="bug-report"
								href={ feedbackURL }
								title="Report an issue"
								target="_blank"
							/>
						</div>
					) }

					<script
						type="text/javascript"
						dangerouslySetInnerHTML={ {
							__html: 'COMMIT_SHA = ' + jsonStringifyForHtml( commitSha ),
						} }
					/>
					{ user && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								__html: 'var currentUser = ' + jsonStringifyForHtml( user ),
							} }
						/>
					) }
					{ app && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								__html: 'var app = ' + jsonStringifyForHtml( app ),
							} }
						/>
					) }
					{ initialReduxState && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								__html: 'var initialReduxState = ' + jsonStringifyForHtml( initialReduxState ),
							} }
						/>
					) }
					{ config && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								__html: config,
							} }
						/>
					) }

					<script
						type="text/javascript"
						dangerouslySetInnerHTML={ {
							__html: `
(function () {
	function generateRandomToken( randomBytesLength ) {
		var randomBytes = [];

		if ( window.crypto && window.crypto.getRandomValues ) {
			randomBytes = new Uint8Array( randomBytesLength );
			window.crypto.getRandomValues( randomBytes );
		} else {
			for ( var i = 0; i < randomBytesLength; ++i ) {
				randomBytes[ i ] = Math.floor( Math.random() * 256 );
			}
		}

		return btoa( String.fromCharCode.apply( String, randomBytes ) );
	}

	// Mini tracks
	function recordTracksEvent( eventName, pathName, loadId ) {
		var statsPixel = '//pixel.wp.com/t.gif';
		var stats = {
			_pf: navigator.platform,
			_lg: navigator.language,
			_en: eventName,
			_ht: window.screen.height,
			_wd: window.screen.width,
			_ut: 'anon',
			_dl: document.location.origin + document.location.pathname,
			_ts: Date.now(),
			_tz: new Date().getTimezoneOffset() / 60,
			_rt: Date.now(),
			path: pathName,
			load_id: loadId
		};

		if ( window.currentUser ) {
			stats[ '_ut' ] = 'wpcom:user_id';
			stats[ '_ul' ] = currentUser.username;
			stats[ '_ui' ] = currentUser.ID;
		}

		var pixel = document.createElement( 'img' );
		pixel.src = statsPixel + '?' + Object.keys( stats ).map( function (key) {
			return encodeURIComponent( key ) + '=' + encodeURIComponent( stats[ key ] );
		} ).join( '&' );

		var body = document.getElementsByTagName( 'body' )[ 0 ];
		body.appendChild( pixel );

		return stats;
	}

	try {
		// exclude e2e tests
		if ( navigator.userAgent.indexOf( 'wp-e2e-test' ) !== -1 ) {
			return;
		}

		var pathName = window.location.pathname.split( "/" ).slice( 1, 2 )[ 0 ];
		if ( pathName === 'log-in' && 'production' === window.configData.env ) {
			var loadId = generateRandomToken( 18 );

			var stats = recordTracksEvent( 'calypso_load_start', '/' + pathName, loadId );

			if ( ! window.calypsoLoadStartTime ) {
				window.calypsoLoadStartTime = {};
			}

			window.calypsoLoadStartTime[ pathName ] = {
				startTimestamp: window.performance.now(),
				loadId: loadId,
			};

		}
	} catch ( ex ) {
		console.error( 'Unable to report load time', ex );
	}
})();`,
						} }
					/>

					{ i18nLocaleScript && <script src={ i18nLocaleScript } /> }
					<script src={ urls.manifest } />
					<script src={ urls.vendor } />
					<script src={ urls[ jsFile ] } />
					{ chunk && <script src={ urls[ chunk ] } /> }
					<script>window.AppBoot();</script>
					<noscript className="wpcom-site__global-noscript">
						Please enable JavaScript in your browser to enjoy WordPress.com.
					</noscript>
					{ /* eslint-enable wpcalypso/jsx-classname-namespace, react/no-danger */ }
				</body>
			</html>
		);
	}
}

export default Document;
