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
import { jsonStringifyForHtml } from '../../server/sanitize';
import Head from '../components/head';
import getStylesheet from './utils/stylesheet';

class Desktop extends React.Component {
	render() {
		const {
			app,
			faviconURL,
			i18nLocaleScript,
			isRTL,
			lang,
			urls,
			hasSecondary,
			config,
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
					<link rel="stylesheet" id="desktop-css" href="/desktop/wordpress-desktop.css" />
				</Head>
				<body className={ classNames( { rtl: isRTL } ) }>
					{ /* eslint-disable wpcalypso/jsx-classname-namespace, react/no-danger */ }
					<div id="wpcom" className="wpcom-site">
						<div className="layout">
							<div className="masterbar" />
							<div className="layout__content">
								<div className="wpcom-site__logo noticon noticon-wordpress" />
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

					{ app && (
						<script
							type="text/javascript"
							dangerouslySetInnerHTML={ {
								__html: 'var app = ' + jsonStringifyForHtml( app ),
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

					<script src="/calypso/build.js" />
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
