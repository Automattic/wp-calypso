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

class Document extends React.Component {
	render() {
		const {
			app,
			chunkFiles,
			commitSha,
			faviconURL,
			head,
			i18nLocaleScript,
			initialReduxState,
			isRTL,
			entrypoint,
			manifest,
			lang,
			renderedLayout,
			user,
			urls,
			hasSecondary,
			sectionGroup,
			clientData,
			isFluidWidth,
			sectionCss,
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
		} = this.props;

		const inlineScript =
			`COMMIT_SHA = ${ jsonStringifyForHtml( commitSha ) };\n` +
			( user ? `var currentUser = ${ jsonStringifyForHtml( user ) };\n` : '' ) +
			( app ? `var app = ${ jsonStringifyForHtml( app ) };\n` : '' ) +
			( initialReduxState
				? `var initialReduxState = ${ jsonStringifyForHtml( initialReduxState ) };\n`
				: '' ) +
			( clientData ? `var configData = ${ jsonStringifyForHtml( clientData ) };` : '' );

		return (
			<html
				lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ classNames( { 'is-fluid-width': isFluidWidth } ) }
			>
				<Head title={ head.title } faviconURL={ faviconURL } cdn={ '//s1.wp.com' }>
					{ head.metas.map( ( props, index ) => <meta { ...props } key={ index } /> ) }
					{ head.links.map( ( props, index ) => <link { ...props } key={ index } /> ) }

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
					{ entrypoint.map( asset => <script key={ asset } src={ asset } /> ) }
					{ chunkFiles.map( chunk => <script key={ chunk } src={ chunk } /> ) }
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
