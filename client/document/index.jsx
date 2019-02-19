/**
 * External dependencies
 *
 * @format
 */

import React, { Fragment } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from 'config';
import Head from '../components/head';
import EnvironmentBadge, {
	TestHelper,
	Branch,
	DevDocsLink,
	PreferencesHelper,
} from '../components/environment-badge';
import getStylesheet from './utils/stylesheet';
import WordPressLogo from 'components/wordpress-logo';
import { jsonStringifyForHtml } from '../../server/sanitize';

const cssChunkLink = asset => (
	<link key={ asset } rel="stylesheet" type="text/css" data-webpack={ true } href={ asset } />
);

class Document extends React.Component {
	render() {
		const {
			app,
			chunkFiles,
			commitSha,
			buildTimestamp,
			faviconURL,
			head,
			i18nLocaleScript,
			initialReduxState,
			isRTL,
			entrypoint,
			manifest,
			lang,
			languageRevisions,
			renderedLayout,
			user,
			urls,
			hasSecondary,
			sectionGroup,
			sectionName,
			clientData,
			isFluidWidth,
			env,
			isDebug,
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
		} = this.props;

		const csskey = isRTL ? 'css.rtl' : 'css.ltr';

		const inlineScript =
			`var COMMIT_SHA = ${ jsonStringifyForHtml( commitSha ) };\n` +
			`var BUILD_TIMESTAMP = ${ jsonStringifyForHtml( buildTimestamp ) };\n` +
			( user ? `var currentUser = ${ jsonStringifyForHtml( user ) };\n` : '' ) +
			( isSupportSession ? 'var isSupportSession = true;\n' : '' ) +
			( app ? `var app = ${ jsonStringifyForHtml( app ) };\n` : '' ) +
			( initialReduxState
				? `var initialReduxState = ${ jsonStringifyForHtml( initialReduxState ) };\n`
				: '' ) +
			( clientData ? `var configData = ${ jsonStringifyForHtml( clientData ) };\n` : '' ) +
			( languageRevisions
				? `var languageRevisions = ${ jsonStringifyForHtml( languageRevisions ) };\n`
				: '' );

		const isIframe = config.isEnabled( 'calypsoify/iframe' ) && sectionName === 'gutenberg-editor';

		return (
			<html
				lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ classNames( { 'is-fluid-width': isFluidWidth, 'is-iframe': isIframe } ) }
			>
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

					<link
						rel="stylesheet"
						id="main-css"
						href={
							urls[ getStylesheet( { rtl: !! isRTL, debug: isDebug || env === 'development' } ) ]
						}
						type="text/css"
					/>
					{ entrypoint[ csskey ].map( cssChunkLink ) }
					{ chunkFiles[ csskey ].map( cssChunkLink ) }
				</Head>
				<body
					className={ classNames( {
						rtl: isRTL,
						'color-scheme': config.isEnabled( 'me/account/color-scheme-picker' ),
						[ 'is-group-' + sectionGroup ]: sectionGroup,
						[ 'is-section-' + sectionName ]: sectionName,
					} ) }
				>
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
									[ 'is-section-' + sectionName ]: sectionName,
								} ) }
							>
								<div className="masterbar" />
								<div className="layout__content">
									<WordPressLogo size={ 72 } className="wpcom-site__logo" />
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
						<EnvironmentBadge badge={ badge } feedbackURL={ feedbackURL }>
							{ preferencesHelper && <PreferencesHelper /> }
							{ abTestHelper && <TestHelper /> }
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

					{ i18nLocaleScript && <script src={ i18nLocaleScript } /> }
					{ /*
					 * inline manifest in production, but reference by url for development.
					 * this lets us have the performance benefit in prod, without breaking HMR in dev
					 * since the manifest needs to be updated on each save
					 */ }
					{ env === 'development' && <script src="/calypso/manifest.js" /> }
					{ env !== 'development' && (
						<script
							nonce={ inlineScriptNonce }
							dangerouslySetInnerHTML={ {
								__html: manifest,
							} }
						/>
					) }
					{ entrypoint.js.map( asset => (
						<script key={ asset } src={ asset } />
					) ) }
					{ chunkFiles.js.map( chunk => (
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
