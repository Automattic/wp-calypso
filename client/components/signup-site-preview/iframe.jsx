/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce, forEach } from 'lodash';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import {
	createPreviewDocumentTitle,
	getIframeSource,
	getPreviewParamClass,
	isIE,
	revokeObjectURL,
} from 'components/signup-site-preview/utils';

export default class SignupSitePreviewIframe extends Component {
	static propTypes = {
		cssUrl: PropTypes.string,
		// Iframe body content
		content: PropTypes.object,
		fontUrl: PropTypes.string,
		gutenbergStylesUrl: PropTypes.string,
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
			this.props.gutenbergStylesUrl !== nextProps.gutenbergStylesUrl ||
			this.props.langSlug !== nextProps.langSlug ||
			this.props.isRtl !== nextProps.isRtl
		) {
			this.setIframeSource( nextProps );
			return false;
		}

		if (
			this.props.content.title !== nextProps.content.title ||
			this.props.content.tagline !== nextProps.content.tagline
		) {
			this.setContentTitle( nextProps.content.title, nextProps.content.tagline );
		}

		if ( this.props.content.body !== nextProps.content.body ) {
			this.setIframeBodyContent( nextProps.content );
		}

		if (
			this.props.content.body !== nextProps.content.body ||
			! isShallowEqual( this.props.content.params, nextProps.content.params )
		) {
			this.setContentParams( nextProps.content.params );
		}

		return false;
	}

	setContentTitle( title, tagline ) {
		this.setIframeElementContent( '.signup-site-preview__title', title );
		this.setIframeElementContent( 'title', createPreviewDocumentTitle( title, tagline ) );
	}

	setContentParams( params ) {
		for ( const [ key, value ] of Object.entries( params ) ) {
			this.setIframeElementContent( `.${ getPreviewParamClass( key ) }`, value );
		}
	}

	setIframeBodyContent( content ) {
		if ( ! this.iframe.current ) {
			return;
		}
		const element = this.iframe.current.contentWindow.document.querySelector( '.entry-content' );

		if ( element ) {
			element.innerHTML = content.body;
			this.props.resize && this.setContainerHeight();
		}
	}

	setIframeElementContent( selector, content ) {
		if ( ! this.iframe.current ) {
			return;
		}
		const elements = this.iframe.current.contentWindow.document.querySelectorAll( selector );

		// Using `_.forEach` instead of a for-of loop to fix environments that need
		// polyfilled. This is probably required because the node list is being
		// pulled out of the iframe environment which hasn't been polyfilled.
		forEach( elements, ( element ) => {
			element.textContent = content;
		} );
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
			this.props.setWrapperHeight( element.scrollHeight + 50 );
		}
	};

	setLoaded = () => {
		this.setOnPreviewClick();
		this.setIframeIsLoading();

		const { params, tagline, title } = this.props.content;

		this.setContentTitle( title, tagline );
		this.setContentParams( params );

		this.props.resize && this.setContainerHeight();
	};

	setIframeSource = ( { content, cssUrl, fontUrl, gutenbergStylesUrl, isRtl, langSlug } ) => {
		if ( ! this.iframe.current ) {
			return;
		}

		const iframeSrc = getIframeSource(
			content,
			cssUrl,
			fontUrl,
			gutenbergStylesUrl,
			isRtl,
			langSlug,
			this.props.scrolling
		);

		if ( isIE() ) {
			this.iframe.current.contentWindow.document.open();
			this.iframe.current.contentWindow.document.write( iframeSrc );
			this.iframe.current.contentWindow.document.close();
		} else {
			revokeObjectURL( this.iframe.current.src );
			this.iframe.current.contentWindow.location.replace( iframeSrc );
		}

		const { params, tagline, title } = content;

		this.setContentTitle( title, tagline );
		this.setContentParams( params );
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
