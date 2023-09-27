import path from 'path';
import config from '@automattic/calypso-config';
import { isLocaleRtl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { Component } from 'react';
import EnvironmentBadge, {
	Branch,
	AccountSettingsHelper,
	AuthHelper,
	DevDocsLink,
	PreferencesHelper,
	FeaturesHelper,
	ReactQueryDevtoolsHelper,
} from 'calypso/components/environment-badge';
import Head from 'calypso/components/head';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { isGravPoweredOAuth2Client } from 'calypso/lib/oauth2-clients';
import { jsonStringifyForHtml } from 'calypso/server/sanitize';
import { initialClientsData } from 'calypso/state/oauth2-clients/reducer';
import { isBilmurEnabled, getBilmurUrl } from './utils/bilmur';
import { chunkCssLinks } from './utils/chunk';

class Document extends Component {
	render() {
		const {
			app,
			accountSettingsHelper,
			authHelper,
			chunkFiles,
			commitSha,
			buildTimestamp,
			head,
			i18nLocaleScript,
			initialReduxState,
			initialQueryState,
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
			reactQueryDevtoolsHelper,
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
			params,
			query,
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
			( initialQueryState
				? `var initialQueryState = ${ jsonStringifyForHtml( initialQueryState ) };\n`
				: '' ) +
			( clientData ? `var configData = ${ jsonStringifyForHtml( clientData ) };\n` : '' ) +
			( languageRevisions
				? `var languageRevisions = ${ jsonStringifyForHtml( languageRevisions ) };\n`
				: '' ) +
			`var installedChunks = ${ jsonStringifyForHtml( installedChunks ) };\n` +
			// Inject the locale if we can get it from the route via `getLanguageRouteParam`
			( params && params.hasOwnProperty( 'lang' )
				? `var localeFromRoute = ${ jsonStringifyForHtml( params.lang ?? '' ) };\n`
				: '' );

		const isJetpackWooCommerceFlow =
			'jetpack-connect' === sectionName && 'woocommerce-onboarding' === requestFrom;

		const isJetpackWooDnaFlow = 'jetpack-connect' === sectionName && isWooDna;

		const theme = config( 'theme' );

		const LoadingLogo = chooseLoadingLogo( this.props, app?.isWpMobileApp );

		const isRTL = isLocaleRtl( lang );

		let headTitle = head.title;
		let headFaviconUrl;

		// To customize the page title and favicon for the Gravatar passwordless login relevant pages.
		if ( sectionName === 'login' && typeof query?.redirect_to === 'string' ) {
			const searchParams = new URLSearchParams( query.redirect_to.split( '?' )[ 1 ] );
			// Get the client ID from the redirect URL to cover the case of a login URL without the "client_id" parameter, e.g. /log-in/link/use
			const oauth2Client = initialClientsData[ searchParams.get( 'client_id' ) ] || {};
			const isGravPoweredClient = isGravPoweredOAuth2Client( oauth2Client );

			headTitle = isGravPoweredClient ? oauth2Client.title : headTitle;
			headFaviconUrl = isGravPoweredClient ? oauth2Client.favicon : headFaviconUrl;
		}

		return (
			<html
				lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ classNames( { 'is-iframe': sectionName === 'gutenberg-editor' } ) }
			>
				<Head
					title={ headTitle }
					branchName={ branchName }
					inlineScriptNonce={ inlineScriptNonce }
					faviconUrl={ headFaviconUrl }
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
							{ reactQueryDevtoolsHelper && <ReactQueryDevtoolsHelper /> }
							{ accountSettingsHelper && <AccountSettingsHelper /> }
							{ preferencesHelper && <PreferencesHelper /> }
							{ featuresHelper && <FeaturesHelper /> }
							{ authHelper && <AuthHelper /> }
							{ branchName && (
								<Branch branchName={ branchName } commitChecksum={ commitChecksum } />
							) }
							{ devDocs && <DevDocsLink url={ devDocsURL } /> }
						</EnvironmentBadge>
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
							data-customproperties={ `{"route_name": "${ sectionName }"}` }
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

function chooseLoadingLogo( { useLoadingEllipsis }, isMobileApp ) {
	if ( useLoadingEllipsis ) {
		return LoadingEllipsis;
	}
	if ( config.isEnabled( 'jetpack-cloud' ) || isMobileApp ) {
		return JetpackLogo;
	}

	return WordPressLogo;
}

export default Document;
