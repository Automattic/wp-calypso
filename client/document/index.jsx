import path from 'path';
import config from '@automattic/calypso-config';
import { isLocaleRtl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { Component } from 'react';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import EnvironmentBadge, {
	Branch,
	AccountSettingsHelper,
	AuthHelper,
	DevDocsLink,
	PreferencesHelper,
	FeaturesHelper,
	ReactQueryDevtoolsHelper,
	StoreSandboxHelper,
} from 'calypso/components/environment-badge';
import Head from 'calypso/components/head';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Loading from 'calypso/components/loading';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import WooCommerceLogo from 'calypso/components/woocommerce-logo';
import WordPressLogo from 'calypso/components/wordpress-logo';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { isGravPoweredOAuth2Client } from 'calypso/lib/oauth2-clients';
import { jsonStringifyForHtml } from 'calypso/server/sanitize';
import { initialClientsData, gravatarClientData } from 'calypso/state/oauth2-clients/reducer';
import { isBilmurEnabled, getBilmurUrl } from './utils/bilmur';
import { chunkCssLinks } from './utils/chunk';

class Document extends Component {
	render() {
		const {
			accountSettingsHelper,
			app,
			authHelper,
			badge,
			branchName,
			buildTimestamp,
			chunkFiles,
			clientData,
			commitChecksum,
			commitSha,
			devDocs,
			devDocsURL,
			entrypoint,
			env,
			featuresHelper,
			feedbackURL,
			head,
			i18nLocaleScript,
			initialQueryState,
			initialReduxState,
			inlineScriptNonce,
			isSupportSession,
			disableHelpCenterAutoOpen,
			isWooDna,
			lang,
			languageRevisions,
			manifests,
			params,
			preferencesHelper,
			query,
			reactQueryDevtoolsHelper,
			renderedLayout,
			sectionGroup,
			sectionName,
			storeSandboxHelper,
			target,
			user,
			useTranslationChunks,
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
			( disableHelpCenterAutoOpen ? 'var disableHelpCenterAutoOpen = true;\n' : '' ) +
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

		const isJetpackWooDnaFlow = 'jetpack-connect' === sectionName && isWooDna;

		const theme = config( 'theme' );

		const LoadingLogo = chooseLoadingLogo( this.props, app?.isWpMobileApp, app?.isWcMobileApp );

		const isRTL = isLocaleRtl( lang );

		let headTitle = head.title;
		let headFaviconUrl;

		// To customize the page title and favicon for Gravatar-related login pages.
		if ( sectionName === 'login' && typeof query?.redirect_to === 'string' ) {
			const searchParams = new URLSearchParams( query.redirect_to.split( '?' )[ 1 ] );
			// To cover the case where the `client_id` is not provided, e.g. /log-in/link/use
			const oauth2Client = initialClientsData[ searchParams.get( 'client_id' ) ] || {};

			if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
				headTitle = oauth2Client.title;
				headFaviconUrl = oauth2Client.favicon;
			} else if ( query?.gravatar_flow ) {
				// Use Gravatar's favicon + title for the Gravatar-related OAuth2 clients in SSR.
				headTitle = gravatarClientData.title;
				headFaviconUrl = gravatarClientData.favicon;
			}
		}

		return (
			<html
				lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ clsx( { 'is-iframe': sectionName === 'gutenberg-editor' } ) }
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
					{ chunkFiles.js.map( ( chunk ) => (
						<link key={ chunk } rel="preload" as="script" href={ chunk } />
					) ) }
				</Head>
				<body
					className={ clsx( {
						rtl: isRTL,
						'color-scheme': config.isEnabled( 'me/account/color-scheme-picker' ),
						[ 'theme-' + theme ]: theme,
						[ 'is-group-' + sectionGroup ]: sectionGroup,
						[ 'is-section-' + sectionName ]: sectionName,
						'is-mobile-app-view': app?.isWpMobileApp || app?.isWcMobileApp,
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
								className={ clsx( 'layout', {
									[ 'is-group-' + sectionGroup ]: sectionGroup,
									[ 'is-section-' + sectionName ]: sectionName,
									'is-jetpack-woo-dna-flow': isJetpackWooDnaFlow,
								} ) }
							>
								<div className="layout__content">
									{ sectionName === 'checkout' || sectionName === 'stepper' ? (
										<Loading className="wpcom-loading__boot" />
									) : (
										<LoadingLogo size={ 72 } className="wpcom-site__logo" />
									) }
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
							{ storeSandboxHelper && <StoreSandboxHelper /> }
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
							data-site-tz="Etc/UTC"
						/>
					) }

					{ entrypoint?.language?.manifest && <script src={ entrypoint.language.manifest } /> }

					{ ( entrypoint?.language?.translations || [] ).map( ( translationChunk ) => (
						<script key={ translationChunk } src={ translationChunk } />
					) ) }

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
				</body>
			</html>
		);
	}
}

function chooseLoadingLogo( { useLoadingEllipsis }, isWpMobileApp, isWcMobileApp ) {
	if ( useLoadingEllipsis ) {
		return LoadingEllipsis;
	}

	if ( isWcMobileApp ) {
		return WooCommerceLogo;
	}

	if ( config.isEnabled( 'jetpack-cloud' ) || isWpMobileApp ) {
		return JetpackLogo;
	}

	if ( isA8CForAgencies() ) {
		return A4ALogo;
	}

	return WordPressLogo;
}

export default Document;
