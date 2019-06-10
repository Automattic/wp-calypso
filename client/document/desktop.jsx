/**
 * External dependencies
 *
 * @format
 */

import React, { Fragment } from 'react';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import Head from '../components/head';
import getStylesheet from './utils/stylesheet';
import WordPressLogo from 'components/wordpress-logo';
import { jsonStringifyForHtml } from '../../server/sanitize';

const cssChunkLink = asset => (
	<link key={ asset } rel="stylesheet" type="text/css" data-webpack={ true } href={ asset } />
);
class Desktop extends React.Component {
	render() {
		const {
			app,
			entrypoint,
			faviconURL,
			i18nLocaleScript,
			isRTL,
			lang,
			urls,
			hasSecondary,
			clientData,
			isFluidWidth,
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
		const csskey = isRTL ? 'css.rtl' : 'css.ltr';
		return (
			<html
				lang={ lang }
				dir={ isRTL ? 'rtl' : 'ltr' }
				className={ classNames( 'is-desktop', { 'is-fluid-width': isFluidWidth } ) }
			>
				<Head title="WordPress.com" faviconURL={ faviconURL } cdn={ '//s1.wp.com' }>
					<link
						rel="stylesheet"
						id="main-css"
						href={
							urls[ getStylesheet( { rtl: !! isRTL, debug: isDebug || env === 'development' } ) ]
						}
						type="text/css"
					/>
					{ entrypoint[ csskey ].map( cssChunkLink ) }
					<link rel="stylesheet" id="desktop-css" href="/desktop/wordpress-desktop.css" />
				</Head>
				<body className={ classNames( { rtl: isRTL } ) }>
					{ /* eslint-disable wpcalypso/jsx-classname-namespace, react/no-danger */ }
					<div id="wpcom" className="wpcom-site">
						<div className="layout">
							<div className="masterbar" />
							<div className="layout__content">
								<WordPressLogo size={ 72 } className="wpcom-site__logo" />
								{ hasSecondary && (
									<Fragment>
										<div className="layout__secondary" />
										<ul className="sidebar" />
									</Fragment>
								) }
							</div>
						</div>
					</div>
					{ badge && (
						<div className="environment-badge">
							{ abTestHelper && <div className="environment is-tests" /> }
							{ branchName && branchName !== 'master' && (
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
							<ExternalLink
								className="bug-report"
								href={ feedbackURL }
								target="_blank"
								title="Report an issue"
							>
								<Gridicon icon="bug" size={ 18 } />
							</ExternalLink>
						</div>
					) }

					{ app && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								__html: 'var app = ' + jsonStringifyForHtml( app ),
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

					{ entrypoint.js.map( asset => (
						<script key={ asset } src={ asset } />
					) ) }
					<script src="/desktop/desktop-app.js" />
					{ i18nLocaleScript && <script src={ i18nLocaleScript } /> }
					<script type="text/javascript">startApp();</script>
					{ /* eslint-enable wpcalypso/jsx-classname-namespace, react/no-danger */ }
				</body>
			</html>
		);
	}
}

export default Desktop;
