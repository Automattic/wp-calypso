/**
 * External dependencies
 *
 */

import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Head from 'components/head';
import { chunkCssLinks } from './utils';
import { jsonStringifyForHtml } from 'server/sanitize';

function DomainsLanding( {
	branchName,
	clientData,
	domainsLandingData,
	inlineScriptNonce,
	env,
	entrypoint,
	head,
	i18nLocaleScript,
	isRTL,
	lang,
	manifest,
	faviconURL,
	addEvergreenCheck,
} ) {
	return (
		<html lang={ lang } dir={ isRTL ? 'rtl' : 'ltr' }>
			<Head
				title={ head.title }
				faviconURL={ faviconURL }
				cdn={ '//s1.wp.com' }
				branchName={ branchName }
				inlineScriptNonce={ inlineScriptNonce }
			>
				{ head.metas.map( ( props, index ) => (
					<meta { ...props } key={ index } />
				) ) }
				{ head.links.map( ( props, index ) => (
					<link { ...props } key={ index } />
				) ) }
				{ chunkCssLinks( entrypoint, isRTL ) }
			</Head>
			<body
				className={ classnames( {
					rtl: isRTL,
				} ) }
			>
				{ /* eslint-disable wpcalypso/jsx-classname-namespace, react/no-danger */ }
				<div id="wpcom" className="wpcom-site">
					<div className="wp has-no-sidebar">
						<div className="domains-landing layout__content" id="content">
							<div className="layout__primary" id="primary" />
						</div>
					</div>
				</div>
				{ domainsLandingData && (
					<script
						type="text/javascript"
						dangerouslySetInnerHTML={ {
							__html: `var domainsLandingData = ${ jsonStringifyForHtml( domainsLandingData ) };`,
						} }
					/>
				) }
				{ clientData && (
					<script
						type="text/javascript"
						dangerouslySetInnerHTML={ {
							__html: `var configData = ${ jsonStringifyForHtml( clientData ) };`,
						} }
					/>
				) }
				{
					// Use <script nomodule> to redirect browsers with no ES module
					// support to the fallback build. ES module support is a convenient
					// test to determine that a browser is modern enough to handle
					// the evergreen bundle.
					addEvergreenCheck && (
						<script
							nonce={ inlineScriptNonce }
							noModule
							dangerouslySetInnerHTML={ {
								__html: `
						(function() {
							var url = window.location.href;

							if ( url.indexOf( 'forceFallback=1' ) === -1 ) {
								url += ( url.indexOf( '?' ) !== -1 ? '&' : '?' );
								url += 'forceFallback=1';
								window.location.href = url;
							}
						})();
						`,
							} }
						/>
					)
				}
				{ i18nLocaleScript && <script src={ i18nLocaleScript } /> }
				{ /*
				 * inline manifest in production, but reference by url for development.
				 * this lets us have the performance benefit in prod, without breaking HMR in dev
				 * since the manifest needs to be updated on each save
				 */ }
				{ env === 'development' && <script src="/calypso/evergreen/manifest.js" /> }
				{ env !== 'development' && (
					<script
						nonce={ inlineScriptNonce }
						dangerouslySetInnerHTML={ {
							__html: manifest,
						} }
					/>
				) }
				{ entrypoint.js.map( ( asset ) => (
					<script key={ asset } src={ asset } />
				) ) }
				<script
					nonce={ inlineScriptNonce }
					dangerouslySetInnerHTML={ {
						__html: `
						 (function() {
							if ( window.console && window.configData && 'development' !== window.configData.env ) {
								console.log( "%cSTOP!", "color:#f00;font-size:xx-large" );
								console.log(
									"%cWait! This browser feature runs code that can alter your website or its security, " +
									"and is intended for developers. If you've been told to copy and paste something here " +
									"to enable a feature, someone may be trying to compromise your account. Please make " +
									"sure you understand the code and trust the source before adding anything here.",
									"font-size:large;"
								);
							}
						})();
						 `,
					} }
				/>
				<script
					nonce={ inlineScriptNonce }
					dangerouslySetInnerHTML={ {
						__html: `
							if ('serviceWorker' in navigator) {
								window.addEventListener('load', function() {
									navigator.serviceWorker.register('/service-worker.js');
								});
							}
						 `,
					} }
				/>
				<noscript className="wpcom-site__global-noscript">
					Please enable JavaScript in your browser to enjoy WordPress.com.
				</noscript>
				{ /* eslint-enable wpcalypso/jsx-classname-namespace, react/no-danger */ }
				{ /* eslint-enable wpcalypso/jsx-classname-namespace*/ }
			</body>
		</html>
	);
}

export default DomainsLanding;
