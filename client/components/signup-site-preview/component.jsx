/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import RootChild from 'components/root-child';

function getIframeContent( content ) {
	return `<body class="home page-template-default page logged-in">
			<div id="page" class="site">
				<header id="masthead" class="site-header">
					<div class="site-branding-container">
						<div class="site-branding">
							<p class="site-title"><a href="#" rel="home">${ content.siteTitle }</a></p>
							<p class="site-description"><a href="#" rel="home">${ content.siteDescription }</a></p>
							<nav id="site-navigation" class="main-navigation" aria-label="Top Menu"></nav>
						</div>
					</div>
				</header>
				<div id="content" class="site-content">
					<section id="primary" class="content-area">
						<main id="main" class="site-main">
							<article class="page type-page status-publish hentry entry">
								<div class="entry-content">${ content.entryContent }</div>
							</article>
						</main>
					</section>
				</div>
			</div>
		</body>`;
}

export class SignupSitePreview extends Component {
	static propTypes = {
		// The viewport device to show initially
		defaultViewportDevice: PropTypes.oneOf( [ 'desktop', 'phone' ] ),
		// External CSS to load
		cssUrl: PropTypes.string.isRequired,
		// Iframe body content
		content: PropTypes.string,
	};

	static defaultProps = {
		defaultViewportDevice: 'desktop',
		content: '',
	};

	/*
		embed CSS
		default body HTML

	*/
	constructor( props ) {
		super( props );
		this.iframe = React.createRef();
	}
	setIframeContent( content ) {
		if ( ! this.iframe ) {
			return;
		}
		this.iframe.contentDocument.open();
		this.iframe.contentDocument.write( content );
		this.iframe.contentDocument.close();
	}

	setLoaded = () => {};

	render() {
		const { isDesktop, isPhone, content } = this.props;
		const className = classNames( this.props.className, 'signup-site-preview', {
			'is-desktop': isDesktop,
			'is-phone': isPhone,
		} );

		return (
			<RootChild>
				<div className={ className }>
					{ /*

							site mockup wrapper
							dynamic iframe with dynamic content

						*/ }
					<iframe
						ref={ this.iframe }
						className="signup-site-preview__iframe"
						src="about:blank"
						onLoad={ this.setLoaded }
						title={ `${ content.siteTitle } – ${ content.siteDescription }` }
					/>
				</div>
			</RootChild>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isDesktop: 'desktop' === ownProps.defaultViewportDevice,
		isPhone: 'phone' === ownProps.defaultViewportDevice,
	} ),
	null
)( localize( SignupSitePreview ) );
