/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import shallowEqual from 'react-pure-render/shallowEqual';

/**
 * Internal dependencies
 */
import {
	createPreviewDocumentTitle,
	getPreviewParamClass,
} from 'components/signup-site-preview/utils';
import {
	setIframeSource,
	setBodyOnClick,
	setEntryContentInnerHTML,
	setIframeElementContent,
	setIframeIsLoading,
	getPageScrollHeight,
} from './iframe-utils';

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
		this.resetAllIframeContent( this.props );
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
			this.resetAllIframeContent( nextProps );
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
			! shallowEqual( this.props.content.params, nextProps.content.params )
		) {
			this.setContentParams( nextProps.content.params );
		}

		return false;
	}

	setContentTitle( title, tagline ) {
		setIframeElementContent( this.iframe, '.signup-site-preview__title', title );
		setIframeElementContent( this.iframe, 'title', createPreviewDocumentTitle( title, tagline ) );
	}

	setContentParams( params ) {
		for ( const [ key, value ] of Object.entries( params ) ) {
			setIframeElementContent( this.iframe, `.${ getPreviewParamClass( key ) }`, value );
		}
	}

	setIframeBodyContent( content ) {
		const success = setEntryContentInnerHTML( this.iframe, content );

		if ( success && this.props.resize ) {
			this.setContainerHeight();
		}
	}

	setOnPreviewClick = () => {
		setBodyOnClick( this.iframe, () =>
			this.props.onPreviewClick( this.props.defaultViewportDevice )
		);
	};

	setContainerHeight = () => {
		const pageScrollHeight = getPageScrollHeight( this.iframe );

		if ( pageScrollHeight !== null ) {
			this.props.setWrapperHeight( pageScrollHeight + 50 );
		}
	};

	setLoaded = () => {
		this.setOnPreviewClick();
		setIframeIsLoading( this.iframe );

		const { params, tagline, title } = this.props.content;

		this.setContentTitle( title, tagline );
		this.setContentParams( params );

		this.props.resize && this.setContainerHeight();
	};

	resetAllIframeContent = ( { content, cssUrl, fontUrl, gutenbergStylesUrl, isRtl, langSlug } ) => {
		setIframeSource(
			this.iframe,
			content,
			cssUrl,
			fontUrl,
			gutenbergStylesUrl,
			isRtl,
			langSlug,
			this.props.scrolling
		);

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
