/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getIframeSource, getIframePageContent } from 'components/signup-site-preview/utils';

/**
 * Style dependencies
 */
import './style.scss';

function MockupChromeMobile() {
	return (
		<div className="signup-site-preview__chrome-mobile">
			<span className="signup-site-preview__chrome-label">
				{ translate( 'Phone', {
					comment: 'Label for a phone-sized preview of a website',
				} ) }
			</span>
		</div>
	);
}

function MockupChromeDesktop() {
	return (
		<div className="signup-site-preview__chrome-desktop">
			<svg width="38" height="10">
				<g>
					<rect width="10" height="10" rx="5" />
					<rect x="14" width="10" height="10" rx="5" />
					<rect x="28" width="10" height="10" rx="5" />
				</g>
			</svg>
			<span className="signup-site-preview__chrome-label">{ translate( 'Website Preview' ) }</span>
		</div>
	);
}

export class SignupSitePreview extends Component {
	static propTypes = {
		// The viewport device to show initially
		defaultViewportDevice: PropTypes.oneOf( [ 'desktop', 'phone' ] ),
		isRtl: PropTypes.bool,
		langSlug: PropTypes.string,
		cssUrl: PropTypes.string,
		fontUrl: PropTypes.string,
		// Iframe body content
		content: PropTypes.object,
		onPreviewClick: PropTypes.func,
	};

	static defaultProps = {
		defaultViewportDevice: 'desktop',
		isRtl: false,
		langSlug: 'en',
		content: {},
		onPreviewClick: () => {},
	};

	constructor( props ) {
		super( props );
		this.iframe = React.createRef();
	}

	componentDidMount() {
		this.setIframeSource();
	}

	shouldComponentUpdate( nextProps ) {
		if (
			this.props.cssUrl !== nextProps.cssUrl ||
			this.props.fontUrl !== nextProps.fontUrl ||
			this.props.langSlug !== nextProps.langSlug
		) {
			this.setIframeSource();
			return false;
		}

		if ( this.props.content.title !== nextProps.content.title ) {
			this.setIframeContent( '.site-builder__title', nextProps.content.title );
			return false;
		}

		if ( this.props.content.tagline !== nextProps.content.tagline ) {
			this.setIframeContent( '.site-builder__description', nextProps.content.tagline );
			return false;
		}

		if ( this.props.content.body !== nextProps.content.body ) {
			this.setIframePageContent( nextProps.content );
			return false;
		}

		return false;
	}

	setIframePageContent( content ) {
		if ( ! this.iframe.current ) {
			return;
		}
		const element = this.iframe.current.contentWindow.document.querySelector( '.entry' );

		if ( element ) {
			element.innerHTML = getIframePageContent( content );
		}
	}

	setIframeContent( selector, content ) {
		if ( ! this.iframe.current ) {
			return;
		}
		const element = this.iframe.current.contentWindow.document.querySelector( selector );

		if ( element ) {
			element.innerHTML = content;
		}
	}

	setOnPreviewClick = () => {
		if ( ! this.iframe.current ) {
			return;
		}

		this.iframe.current.contentWindow.document.querySelector( '.home' ).onclick = () =>
			this.props.onPreviewClick( this.props.defaultViewportDevice );
	};

	setIframeIsLoading = () => {
		if ( ! this.iframe.current ) {
			return;
		}

		this.iframe.current.contentWindow.document
			.querySelector( '.home' )
			.classList.remove( 'is-loading' );
	};

	setLoaded = () => {
		this.setOnPreviewClick();
		this.setIframeIsLoading();
	};

	setIframeSource = () => {
		if ( ! this.iframe.current ) {
			return;
		}
		const { cssUrl, fontUrl, content, isRtl, langSlug } = this.props;

		// For memory management: https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
		URL.revokeObjectURL( this.iframe.current.src );

		this.iframe.current.src = getIframeSource( content, cssUrl, fontUrl, isRtl, langSlug );
	};

	render() {
		const { content, isDesktop, isPhone } = this.props;
		const className = classNames( this.props.className, 'signup-site-preview__wrapper', {
			'is-desktop': isDesktop,
			'is-phone': isPhone,
		} );

		return (
			<div className={ className }>
				<div className="signup-site-preview__iframe-wrapper">
					{ isPhone ? <MockupChromeMobile /> : <MockupChromeDesktop /> }
					<iframe
						ref={ this.iframe }
						className="signup-site-preview__iframe"
						title={ `${ content.title } – ${ content.tagline }` }
						onLoad={ this.setLoaded }
					/>
				</div>
			</div>
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
