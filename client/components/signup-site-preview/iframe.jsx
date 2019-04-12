/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

/**
 * Internal dependencies
 */
import { getIframeSource, getIframePageContent, isIE } from 'components/signup-site-preview/utils';

export default class SignupSitePreviewIframe extends Component {
	static propTypes = {
		cssUrl: PropTypes.string,
		// Iframe body content
		content: PropTypes.object,
		fontUrl: PropTypes.string,
		isRtl: PropTypes.bool,
		langSlug: PropTypes.string,
		onPreviewClick: PropTypes.func,
		resize: PropTypes.bool,
		setIsLoaded: PropTypes.func,
		setWrapperHeight: PropTypes.func,
		scrolling: PropTypes.bool,
	};

	static defaultProps = {
		isRtl: false,
		langSlug: 'en',
		content: {},
		onPreviewClick: () => {},
		setIsLoaded: () => {},
		setWrapperHeight: () => {},
		resize: false,
		scrolling: true,
	};

	constructor( props ) {
		super( props );
		this.iframe = React.createRef();
	}

	componentDidMount() {
		this.setIframeSource( this.props );
		if ( this.props.resize ) {
			this.resizeListener = window.addEventListener(
				'resize',
				debounce( this.setContainerHeight, 50 )
			);
		}
	}

	componentWillUnmount() {
		this.resizeListener && window.removeEventListener( 'resize', this.resizeListener );
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
			this.setIframeElementContent( '.site-builder__title', nextProps.content.title );
			return false;
		}

		if ( this.props.content.tagline !== nextProps.content.tagline ) {
			this.setIframeElementContent( '.site-builder__description', nextProps.content.tagline );
			return false;
		}

		if ( this.props.content.body !== nextProps.content.body ) {
			this.setIframeBodyContent( nextProps.content );
			return false;
		}

		return false;
	}

	setIframeBodyContent( content ) {
		if ( ! this.iframe.current ) {
			return;
		}
		const element = this.iframe.current.contentWindow.document.querySelector( '.entry' );

		if ( element ) {
			element.innerHTML = getIframePageContent( content );
			this.setContainerHeight();
		}
	}

	setIframeElementContent( selector, content ) {
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
		const element = this.iframe.current.contentWindow.document.body;

		if ( element ) {
			element.onclick = () => this.props.onPreviewClick( this.props.defaultViewportDevice );
		}
	};

	setIframeIsLoading = () => {
		if ( ! this.iframe.current ) {
			return;
		}
		const element = this.iframe.current.contentWindow.document.querySelector( '.home' );

		if ( element ) {
			element.classList.remove( 'is-loading' );
		}
	};

	setContainerHeight = () => {
		if ( ! this.iframe.current ) {
			return;
		}

		const element = this.iframe.current.contentWindow.document.querySelector( '#page' );

		if ( element ) {
			this.props.setWrapperHeight( element.scrollHeight + 25 );
		}
	};

	setLoaded = () => {
		this.setOnPreviewClick();
		this.setIframeIsLoading();
		this.props.resize && this.setContainerHeight();
	};

	setIframeSource = ( { content, cssUrl, fontUrl, isRtl, langSlug } ) => {
		if ( ! this.iframe.current ) {
			return;
		}

		const iframeSrc = getIframeSource(
			content,
			cssUrl,
			fontUrl,
			isRtl,
			langSlug,
			this.props.scrolling
		);

		if ( isIE() ) {
			this.iframe.current.contentWindow.document.open();
			this.iframe.current.contentWindow.document.write( iframeSrc );
			this.iframe.current.contentWindow.document.close();
		} else {
			// For memory management: https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
			URL.revokeObjectURL( this.iframe.current.src );
			this.iframe.current.src = iframeSrc;
		}
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
