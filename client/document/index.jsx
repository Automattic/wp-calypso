import path from 'path';
import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { Component } from 'react';
import EnvironmentBadge, {
	Branch,
	AuthHelper,
	DevDocsLink,
	PreferencesHelper,
	FeaturesHelper,
} from 'calypso/components/environment-badge';
import Head from 'calypso/components/head';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { jsonStringifyForHtml } from 'calypso/server/sanitize';
import { isBilmurEnabled, getBilmurUrl } from './utils/bilmur';
import { chunkCssLinks } from './utils/chunk';

class Document extends Component {
	render() {
		const {
			app,
			authHelper,
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
			'jetpack-connect' === sectionName && 'woocommerce-onboarding' === requestFrom;

		const isJetpackWooDnaFlow = 'jetpack-connect' === sectionName && isWooDna;

		const theme = config( 'theme' );

		const LoadingLogo = chooseLoadingLogo( this.props );

		const unsupportedBrowser = true;
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
						'is-mobile-app-view': app?.isWpMobileApp,
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
							{ featuresHelper && <FeaturesHelper /> }
							{ authHelper && <AuthHelper /> }
							{ branchName && (
								<Branch branchName={ branchName } commitChecksum={ commitChecksum } />
							) }
							{ devDocs && <DevDocsLink url={ devDocsURL } /> }
						</EnvironmentBadge>
					) }

					{ unsupportedBrowser && (
						<script
							nonce={ inlineScriptNonce }
							dangerouslySetInnerHTML={ {
								__html: `
							(function() {
								/* Main Banner Element */
								var banner = document.createElement( 'div' )
								banner.appendChild( document.createTextNode( 'This browser is unsupported.' ) );

								banner.style = " \
									position: absolute; \
									top: 0; \
									left: 0;\
									right: 0;\
									height: 50px;\
									background-color: #d63638;\
									z-index: 999;\
									transform: translateY(-50px);\
									line-height: 50px;\
									font-size: 30px;\
									color: white;\
									padding: 0 16px;\
								"

								/* More Info Link */
								var info = document.createElement( 'a' )
								info.appendChild( document.createTextNode( 'More information' ) )
									info.style = "\
									font-size: 15px;\
									color: white; \
									margin-left: 10px; \
									font-weight: bold;\
									font-size; 15px;\
								"
								info.href='https://browsehappy.com'
								banner.appendChild( info )

								/* The Close Button */
								var closeButton = document.createElement( 'button' )

								closeButton.appendChild( document.createTextNode( 'Close' ) )
								
								closeButton.style = "\
									position: absolute;\
									right: 6px\
									margin: 10px;\
									height: 30px;\
								"

								closeButton.onclick = function () {
									document.querySelector( 'body' ).style.transform = null
									// We will still have a reference to this element.
									if ( banner ) {
										// .remove() is unsupported in IE
										banner.parentNode.removeChild( banner )
									}
								}
								banner.appendChild( closeButton )

								document.querySelector( 'body' ).insertAdjacentElement( 'afterbegin', banner )
								document.querySelector( 'body' ).style.transform = 'translateY(50px)'
								
								// Move focus to the "modal". Perhaps a different element?
								info.focus()
							})();
							`,
							} }
						/>
					) }
					<script
						type="text/javascript"
						nonce={ inlineScriptNonce }
						dangerouslySetInnerHTML={ {
							__html: inlineScript,
						} }
					/>
					{ i18nLocaleScript && ! useTranslationChunks && <script src={ i18nLocaleScript } /> }
					{ /*
					 * inline manifest in production, but reference by url for development.
					 * this lets us have the performance benefit in prod, without breaking HMR in dev
					 * since the manifest needs to be updated on each save
					 */ }
					{ env === 'development' && <script src={ `/calypso/${ target }/runtime.js` } /> }
					{ env !== 'development' &&
						manifests.map( ( manifest ) => (
							<script
								nonce={ inlineScriptNonce }
								dangerouslySetInnerHTML={ {
									__html: manifest,
								} }
							/>
						) ) }

					{ isBilmurEnabled() && (
						<script
							defer
							id="bilmur"
							src={ getBilmurUrl() }
							data-provider="wordpress.com"
							data-service="calypso"
						/>
					) }

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

function chooseLoadingLogo( { useLoadingEllipsis } ) {
	if ( useLoadingEllipsis ) {
		return LoadingEllipsis;
	}
	if ( config.isEnabled( 'jetpack-cloud' ) ) {
		return JetpackLogo;
	}

	return WordPressLogo;
}

export default Document;
