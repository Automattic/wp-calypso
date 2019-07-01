/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import debugModule from 'debug';
import { identity, noop, isFunction } from 'lodash';
import page from 'page';
import { v4 as uuid } from 'uuid';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { hasTouch } from './touch-detect';
import SpinnerLine from '../spinner-line';

const debug = debugModule( 'calypso:web-preview' );

export class WebPreviewContent extends Component {
	previewId = uuid();
	_hasTouch = false;

	state = {
		iframeUrl: null,
		loaded: false,
		isLoadingSubpage: false,
	};

	setIframeInstance = ref => {
		this.iframe = ref;
	};

	UNSAFE_componentWillMount() {
		// Cache touch and mobile detection for the entire lifecycle of the component
		this._hasTouch = hasTouch();
	}

	componentDidMount() {
		const { previewMarkup, previewUrl } = this.props;

		window.addEventListener( 'message', this.handleMessage );
		if ( previewUrl ) {
			this.setIframeUrl( previewUrl );
		}
		if ( previewMarkup ) {
			this.setIframeMarkup( previewMarkup );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.handleMessage );
	}

	componentDidUpdate( prevProps ) {
		const { previewMarkup, previewUrl, showPreview } = this.props;

		this.setIframeUrl( previewUrl );

		// If the previewMarkup changes, re-render the iframe contents
		if ( previewMarkup && previewMarkup !== prevProps.previewMarkup ) {
			this.setIframeMarkup( previewMarkup );
		}
		// If the previewMarkup is erased, remove the iframe contents
		if ( ! previewMarkup && prevProps.previewMarkup ) {
			debug( 'removing iframe contents' );
			this.setIframeMarkup( '' );
		}
		// Focus preview when showing modal
		if ( showPreview && ! prevProps.showPreview && this.state.loaded ) {
			this.focusIfNeeded();
		}
	}

	handleMessage = e => {
		let data;
		try {
			data = JSON.parse( e.data );
		} catch ( err ) {
			return;
		}

		if ( ! data || data.channel !== 'preview-' + this.previewId ) {
			return;
		}
		debug( 'message from iframe', data );

		switch ( data.type ) {
			case 'link':
				page( data.payload.replace( /^https:\/\/wordpress\.com\//i, '/' ) );
				this.props.onClose();
				return;
			case 'close':
				this.props.onClose();
				return;
			case 'partially-loaded':
				this.setLoaded();
				return;
			case 'location-change':
				this.handleLocationChange( data.payload );
				return;
			case 'focus':
				this.removeSelection();
				// we will fake a click here to close the dropdown
				this.wrapperElementRef && this.wrapperElementRef.click();
				return;
			case 'loading':
				this.setState( { isLoadingSubpage: true } );
				return;
		}
	};

	handleLocationChange = payload => {
		this.props.onLocationUpdate( payload.pathname );
		this.setState( { isLoadingSubpage: false } );
	};

	setWrapperElement = el => {
		this.wrapperElementRef = el;
	};

	removeSelection = () => {
		// remove all textual selections when user gives focus to preview iframe
		// they might be confusing
		if ( typeof window !== 'undefined' ) {
			if ( isFunction( window.getSelection ) ) {
				const selection = window.getSelection();
				if ( isFunction( selection.empty ) ) {
					selection.empty();
				} else if ( isFunction( selection.removeAllRanges ) ) {
					selection.removeAllRanges();
				}
			} else if ( document.selection && isFunction( document.selection.empty ) ) {
				document.selection.empty();
			}
		}
	};

	focusIfNeeded = () => {
		// focus content unless we are running in closed modal or on empty page
		if ( this.iframe.contentWindow && this.state.iframeUrl !== 'about:blank' ) {
			debug( 'focusing iframe contents' );
			this.iframe.contentWindow.focus();
		}
	};

	setIframeMarkup( content ) {
		if ( ! this.iframe ) {
			debug( 'no iframe to update' );
			return;
		}
		debug( 'adding markup to iframe', content.length );
		this.iframe.contentDocument.open();
		this.iframe.contentDocument.write( content );
		this.iframe.contentDocument.close();
	}

	setIframeUrl = iframeUrl => {
		if ( ! this.iframe || ( ! this.props.showPreview && this.props.isModalWindow ) ) {
			return;
		}

		// Bail if we've already set this url
		if ( iframeUrl === this.state.iframeUrl ) {
			return;
		}

		debug( 'setIframeUrl', iframeUrl );
		try {
			const newUrl = this.props.filterIframeUrl( iframeUrl );
			this.iframe.contentWindow.location.replace( newUrl );

			this.setState( { iframeUrl } );

			const isHashChangeOnly =
				iframeUrl.replace( /#.*$/, '' ) === this.state.iframeUrl.replace( /#.*$/, '' );
			if ( ! isHashChangeOnly ) {
				this.setState( { loaded: false } );
			}
		} catch ( e ) {}
	};

	setLoaded = () => {
		if ( this.state.loaded && ! this.state.isLoadingSubpage ) {
			debug( 'already loaded' );
			return;
		}
		if ( ! this.state.iframeUrl && ! this.props.previewMarkup ) {
			debug( 'preview loaded, but nothing to show' );
			return;
		}
		if ( this.props.previewMarkup ) {
			debug( 'preview loaded with markup' );
			this.props.onLoad( this.iframe.contentDocument );
		} else {
			debug( 'preview loaded for url:', this.state.iframeUrl );
		}
		this.setState( { loaded: true, isLoadingSubpage: false } );

		if ( ! this.props.disableFocus ) {
			this.focusIfNeeded();
		}
	};

	render() {
		const {
			belowToolbar,
			className,
			device,
			hasSidebar,
			iframeTitle,
			isModalWindow,
			loadingMessage,
			previewContent,
			showPreview,
			Toolbar,
		} = this.props;
		const wrapperClassNames = classNames( className, 'web-preview__inner', `is-${ device }`, {
			'is-touch': this._hasTouch,
			'is-with-sidebar': hasSidebar,
			'is-visible': showPreview,
			'is-loaded': this.state.loaded,
			'has-toolbar': Toolbar,
		} );

		const showLoadingMessage =
			! this.state.loaded && loadingMessage && ( showPreview || ! isModalWindow );

		return (
			<div className={ wrapperClassNames } ref={ this.setWrapperElement }>
				{ Toolbar ? <Toolbar isLoading={ this.state.isLoadingSubpage } { ...this.props } /> : null }
				{ belowToolbar }
				{ ( ! this.state.loaded || this.state.isLoadingSubpage ) && <SpinnerLine /> }
				<div className="web-preview__placeholder">
					{ ! previewContent && showLoadingMessage && (
						<div className="web-preview__loading-message-wrapper">
							<span className="web-preview__loading-message">{ loadingMessage }</span>
						</div>
					) }
					{ previewContent ? (
						previewContent
					) : (
						<div
							className={ classNames( 'web-preview__frame-wrapper', {
								'is-resizable': ! isModalWindow,
							} ) }
						>
							<iframe
								ref={ this.setIframeInstance }
								className="web-preview__frame"
								src="about:blank"
								onLoad={ this.setLoaded }
								title={ iframeTitle || __( 'Preview' ) }
							/>
						</div>
					) }
				</div>
			</div>
		);
	}
}

WebPreviewContent.propTypes = {
	// The markup to display in the iframe
	previewMarkup: PropTypes.string,
	// The function to call when the iframe is loaded. Will be passed the iframe document object.
	// Only called if using previewMarkup.
	onLoad: PropTypes.func,
	// Called when the iframe's location updates
	onLocationUpdate: PropTypes.func,
	// Called when the preview is closed, either via the 'X' button or the escape key
	onClose: PropTypes.func,
	// Called when the edit button is clicked
	onEdit: PropTypes.func,
	// Optional loading message to display during loading
	loadingMessage: PropTypes.oneOfType( [ PropTypes.array, PropTypes.string ] ),
	// The iframe's title element, used for accessibility purposes
	iframeTitle: PropTypes.string,
	// Makes room for a sidebar if desired
	hasSidebar: PropTypes.bool,
	// Flag that differentiates modal window from inline embeds
	isModalWindow: PropTypes.bool,
	// Flag to prevent focusing of the preview when set to true
	disableFocus: PropTypes.bool,
	// Toolbar element to be rendered on top of the preview
	Toolbar: PropTypes.func,
	// Filter the iframe URL to allow passing in query args
	filterIframeUrl: PropTypes.func,
	// Content used to override the displayed iframe content preview area
	previewContent: PropTypes.object,
};

WebPreviewContent.defaultProps = {
	belowToolbar: null,
	previewUrl: null,
	previewMarkup: null,
	onLoad: noop,
	onLocationUpdate: noop,
	onClose: noop,
	onEdit: noop,
	hasSidebar: false,
	isModalWindow: false,
	overridePost: null,
	disableFocus: false,
	filterIframeUrl: identity,
	previewContent: null,
};

export default WebPreviewContent;
