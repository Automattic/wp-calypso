/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getIframeSource, getIframePageContent } from 'components/signup-site-preview/utils';

export default class SignupSitePreviewIframe extends Component {
	static propTypes = {
		isRtl: PropTypes.bool,
		langSlug: PropTypes.string,
		cssUrl: PropTypes.string,
		fontUrl: PropTypes.string,
		// Iframe body content
		content: PropTypes.object,
		onPreviewClick: PropTypes.func,
		setIsLoaded: PropTypes.func,
	};

	static defaultProps = {
		isRtl: false,
		langSlug: 'en',
		content: {},
		onPreviewClick: () => {},
		setIsLoaded: () => {},
	};

	constructor( props ) {
		super( props );
		this.iframe = React.createRef();
	}

	componentDidMount() {
		this.setIframeSource( this.props );
	}

	shouldComponentUpdate( nextProps ) {
		if (
			this.props.cssUrl !== nextProps.cssUrl ||
			this.props.fontUrl !== nextProps.fontUrl ||
			this.props.langSlug !== nextProps.langSlug
		) {
			this.setIframeSource( nextProps );
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
		this.props.setIsLoaded( true );
	};

	setIframeSource = ( { content, cssUrl, fontUrl, isRtl, langSlug } ) => {
		if ( ! this.iframe.current ) {
			return;
		}
		// For memory management: https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
		URL.revokeObjectURL( this.iframe.current.src );

		this.iframe.current.src = getIframeSource( content, cssUrl, fontUrl, isRtl, langSlug );
	};

	render() {
		return (
			<iframe
				ref={ this.iframe }
				className="signup-site-preview__iframe"
				onLoad={ this.setLoaded }
				title="WordPress.com"
			/>
		);
	}
}
