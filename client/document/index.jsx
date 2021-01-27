/**
 * External dependencies
 *
 */
import React from 'react';
import classNames from 'classnames';
import path from 'path';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import Head from 'calypso/components/head';
import EnvironmentBadge, {
	TestHelper,
	Branch,
	DevDocsLink,
	PreferencesHelper,
	FeaturesHelper,
} from 'calypso/components/environment-badge';
import { chunkCssLinks } from './utils';
import JetpackLogo from 'calypso/components/jetpack-logo';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { jsonStringifyForHtml } from 'calypso/server/sanitize';

class Document extends React.Component {
	render() {
		const {
			app,
			chunkFiles,
			commitSha,
			buildTimestamp,
			head,
			i18nLocaleScript,
			initialReduxState,
			isRTL,
			entrypoint,
			manifests,
			lang,
			languageRevisions,
			renderedLayout,
			user,
			sectionGroup,
			sectionName,
			clientData,
			env,
			badge,
			abTestHelper,
			preferencesHelper,
			branchName,
			commitChecksum,
			devDocs,
			devDocsURL,
			feedbackURL,
			inlineScriptNonce,
			isSupportSession,
			isWCComConnect,
			isWooDna,
			addEvergreenCheck,
			requestFrom,
			useTranslationChunks,
			target,
			featuresHelper,
		} = this.props;

		const installedChunks = entrypoint.js
			.concat( chunkFiles.js )
			.map( ( chunk ) => path.parse( chunk ).name );

		const inlineScript =
			`var COMMIT_SHA = ${ jsonStringifyForHtml( commitSha ) };\n` +
			`var BUILD_TIMESTAMP = ${ jsonStringifyForHtml( buildTimestamp ) };\n` +
			`var BUILD_TARGET = ${ jsonStringifyForHtml( target ) };\n` +
			( user ? `var currentUser = ${ jsonStringifyForHtml( user ) };\n` : '' ) +
			( isSupportSession ? 'var isSupportSession = true;\n' : '' ) +
			( app ? `var app = ${ jsonStringifyForHtml( app ) };\n` : '' ) +
			( initialReduxState
				? `var initialReduxState = ${ jsonStringifyForHtml( initialReduxState ) };\n`
				: '' ) +
			( clientData ? `var configData = ${ jsonStringifyForHtml( clientData ) };\n` : '' ) +
			( languageRevisions
				? `var languageRevisions = ${ jsonStringifyForHtml( languageRevisions ) };\n`
				: '' ) +
			`var installedChunks = ${ jsonStringifyForHtml( installedChunks ) };\n`;

		const isJetpackWooCommerceFlow =
			config.isEnabled( 'jetpack/connect/woocommerce' ) &&
			'jetpack-connect' === sectionName &&
			'woocommerce-onboarding' === requestFrom;

		const isJetpackWooDnaFlow = 'jetpack-connect' === sectionName && isWooDna;

		const theme = config( 'theme' );

		const LoadingLogo = config.isEnabled( 'jetpack-cloud' ) ? JetpackLogo : WordPressLogo;

		return (
			<html
				lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ classNames( { 'is-iframe': sectionName === 'gutenberg-editor' } ) }
			>
				<Head
					title={ head.title }
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
					{ chunkCssLinks( chunkFiles, isRTL ) }
				</Head>
				<body
					className={ classNames( {
						rtl: isRTL,
						'color-scheme': config.isEnabled( 'me/account/color-scheme-picker' ),
						[ 'theme-' + theme ]: theme,
						[ 'is-group-' + sectionGroup ]: sectionGroup,
						[ 'is-section-' + sectionName ]: sectionName,
						'is-white-signup': sectionName === 'signup',
					} ) }
				>
					{ /* eslint-disable wpcalypso/jsx-classname-namespace, react/no-danger */ }
					{ renderedLayout ? (
						<div
							id="wpcom"
							className="wpcom-site"
							data-calypso-ssr="true"
							dangerouslySetInnerHTML={ {
								__html: renderedLayout,
							} }
						/>
					) : (
						<div id="wpcom" className="wpcom-site">
							<div
								className={ classNames( 'layout', {
									[ 'is-group-' + sectionGroup ]: sectionGroup,
									[ 'is-section-' + sectionName ]: sectionName,
									'is-jetpack-woocommerce-flow': isJetpackWooCommerceFlow,
									'is-jetpack-woo-dna-flow': isJetpackWooDnaFlow,
									'is-wccom-oauth-flow': isWCComConnect,
								} ) }
							>
								<div className="layout__content">
									<LoadingLogo size={ 72 } className="wpcom-site__logo" />
								</div>
							</div>
						</div>
					) }
					{ badge && (
						<EnvironmentBadge badge={ badge } feedbackURL={ feedbackURL }>
							{ preferencesHelper && <PreferencesHelper /> }
							{ abTestHelper && <TestHelper /> }
							{ branchName && (
								<Branch branchName={ branchName } commitChecksum={ commitChecksum } />
							) }
							{ devDocs && <DevDocsLink url={ devDocsURL } /> }
							{ featuresHelper && <FeaturesHelper /> }
						</EnvironmentBadge>
					) }

					<script
						type="text/javascript"
						nonce={ inlineScriptNonce }
						dangerouslySetInnerHTML={ {
							__html: inlineScript,
						} }
					/>

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

					{ i18nLocaleScript && ! useTranslationChunks && <script src={ i18nLocaleScript } /> }
					{ /*
					 * inline manifest in production, but reference by url for development.
					 * this lets us have the performance benefit in prod, without breaking HMR in dev
					 * since the manifest needs to be updated on each save
					 */ }
					{ env === 'development' && (
						<>
							<script src={ `/calypso/${ target }/manifest.js` } />
							<script src={ `/calypso/${ target }/runtime.js` } />
						</>
					) }
					{ env !== 'development' &&
						manifests.map( ( manifest ) => (
							<script
								nonce={ inlineScriptNonce }
								dangerouslySetInnerHTML={ {
									__html: manifest,
								} }
							/>
						) ) }

					{ entrypoint?.language?.manifest && <script src={ entrypoint.language.manifest } /> }

					{ ( entrypoint?.language?.translations || [] ).map( ( translationChunk ) => (
						<script key={ translationChunk } src={ translationChunk } />
					) ) }

					{ entrypoint.js.map( ( asset ) => (
						<script key={ asset } src={ asset } />
					) ) }

					{ chunkFiles.js.map( ( chunk ) => (
						<script key={ chunk } src={ chunk } />
					) ) }
					<script nonce={ inlineScriptNonce } type="text/javascript">
						window.AppBoot();
					</script>
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
				</body>
			</html>
		);
	}
}

export default Document;
