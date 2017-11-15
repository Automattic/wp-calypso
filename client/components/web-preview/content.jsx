/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import debugModule from 'debug';
import { noop, isFunction } from 'lodash';
import page from 'page';
import { v4 as uuid } from 'uuid';
import addQueryArgs from 'lib/route/add-query-args';

/**
 * Internal dependencies
 */
import Toolbar from './toolbar';
import touchDetect from 'lib/touch-detect';
import { isWithinBreakpoint } from 'lib/viewport';
import { localize } from 'i18n-calypso';
import SpinnerLine from 'components/spinner-line';
import SeoPreviewPane from 'components/seo-preview-pane';
import { recordTracksEvent } from 'state/analytics/actions';

const debug = debugModule( 'calypso:web-preview' );

export class WebPreviewContent extends PureComponent {
	previewId = uuid();
	_hasTouch = false;

	state = {
		iframeUrl: null,
		device: this.props.defaultViewportDevice || 'computer',
		loaded: false,
		isLoadingSubpage: false,
	};

	setIframeInstance = ref => {
		this.iframe = ref;
	};

	componentWillMount() {
		// Cache touch and mobile detection for the entire lifecycle of the component
		this._hasTouch = touchDetect.hasTouch();
	}

	componentDidMount() {
		window.addEventListener( 'message', this.handleMessage );
		if ( this.props.previewUrl ) {
			this.setIframeUrl( this.props.previewUrl );
		}
		if ( this.props.previewMarkup ) {
			this.setIframeMarkup( this.props.previewMarkup );
		}

		this.props.onDeviceUpdate( this.state.device );
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.handleMessage );
	}

	componentDidUpdate( prevProps ) {
		const { previewUrl } = this.props;

		this.setIframeUrl( previewUrl );

		// If the previewMarkup changes, re-render the iframe contents
		if ( this.props.previewMarkup && this.props.previewMarkup !== prevProps.previewMarkup ) {
			this.setIframeMarkup( this.props.previewMarkup );
		}
		// If the previewMarkup is erased, remove the iframe contents
		if ( ! this.props.previewMarkup && prevProps.previewMarkup ) {
			debug( 'removing iframe contents' );
			this.setIframeMarkup( '' );
		}
		// Focus preview when showing modal
		if ( this.props.showPreview && ! prevProps.showPreview && this.state.loaded ) {
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
		if ( global.window ) {
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
			const newUrl =
				iframeUrl === 'about:blank'
					? iframeUrl
					: addQueryArgs( { calypso_token: this.previewId }, iframeUrl );
			this.iframe.contentWindow.location.replace( newUrl );

			this.setState( { iframeUrl } );

			const isHashChangeOnly =
				iframeUrl.replace( /#.*$/, '' ) === this.state.iframeUrl.replace( /#.*$/, '' );
			if ( ! isHashChangeOnly ) {
				this.setState( { loaded: false } );
			}
		} catch ( e ) {}
	};

	setDeviceViewport = ( device = 'computer' ) => {
		this.setState( { device } );

		this.props.recordTracksEvent( 'calypso_web_preview_select_viewport_device', { device } );

		if ( typeof this.props.onDeviceUpdate === 'function' ) {
			this.props.onDeviceUpdate( device );
		}
	};

	selectSEO = () => {
		this.setDeviceViewport( 'seo' );
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

		this.focusIfNeeded();
	};

	render() {
		const { translate } = this.props;

		const className = classNames( this.props.className, 'web-preview__inner', {
			'is-touch': this._hasTouch,
			'is-with-sidebar': this.props.hasSidebar,
			'is-visible': this.props.showPreview,
			'is-computer': this.state.device === 'computer',
			'is-tablet': this.state.device === 'tablet',
			'is-phone': this.state.device === 'phone',
			'is-seo': this.state.device === 'seo',
			'is-loaded': this.state.loaded,
		} );

		const showLoadingMessage =
			! this.state.loaded &&
			this.props.loadingMessage &&
			( this.props.showPreview || ! this.props.isModalWindow ) &&
			this.state.device !== 'seo';

		return (
			<div className={ className } ref={ this.setWrapperElement }>
				<Toolbar
					setDeviceViewport={ this.setDeviceViewport }
					device={ this.state.device }
					{ ...this.props }
					showExternal={ this.props.previewUrl ? this.props.showExternal : false }
					showDeviceSwitcher={ this.props.showDeviceSwitcher && isWithinBreakpoint( '>660px' ) }
					selectSeoPreview={ this.selectSEO }
					isLoading={ this.state.isLoadingSubpage }
				/>
				{ ( ! this.state.loaded || this.state.isLoadingSubpage ) && <SpinnerLine /> }
				<div className="web-preview__placeholder">
					{ showLoadingMessage && (
						<div className="web-preview__loading-message-wrapper">
							<span className="web-preview__loading-message">{ this.props.loadingMessage }</span>
						</div>
					) }
					<div
						className={ classNames( 'web-preview__frame-wrapper', {
							'is-resizable': ! this.props.isModalWindow,
						} ) }
						style={ { display: 'seo' === this.state.device ? 'none' : 'inherit' } }
					>
						<iframe
							ref={ this.setIframeInstance }
							className="web-preview__frame"
							src="about:blank"
							onLoad={ this.setLoaded }
							title={ this.props.iframeTitle || translate( 'Preview' ) }
						/>
					</div>
					{ 'seo' === this.state.device && (
						<SeoPreviewPane frontPageMetaDescription={ this.props.frontPageMetaDescription } />
					) }
				</div>
			</div>
		);
	}
}

WebPreviewContent.propTypes = {
	// Display the preview
	showPreview: PropTypes.bool,
	// Show external link button
	showExternal: PropTypes.bool,
	// Show external link with clipboard input
	showUrl: PropTypes.bool,
	// Show close button
	showClose: PropTypes.bool,
	// Show SEO button
	showSEO: PropTypes.bool,
	// Show device viewport switcher
	showDeviceSwitcher: PropTypes.bool,
	// Show edit button
	showEdit: PropTypes.bool,
	// The URL for the edit button
	editUrl: PropTypes.string,
	// The URL that should be displayed in the iframe
	previewUrl: PropTypes.string,
	// The URL for the external link button
	externalUrl: PropTypes.string,
	// The markup to display in the iframe
	previewMarkup: PropTypes.string,
	// The viewport device to show initially
	defaultViewportDevice: PropTypes.string,
	// Elements to render on the right side of the toolbar
	children: PropTypes.node,
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
	// Called after user switches device
	onDeviceUpdate: PropTypes.func,
	// Flag that differentiates modal window from inline embeds
	isModalWindow: PropTypes.bool,
	// The site/post description passed to the SeoPreviewPane
	frontPageMetaDescription: PropTypes.string,
};

WebPreviewContent.defaultProps = {
	showExternal: true,
	showClose: true,
	showSEO: true,
	showDeviceSwitcher: true,
	showEdit: false,
	editUrl: null,
	previewUrl: null,
	previewMarkup: null,
	onLoad: noop,
	onLocationUpdate: noop,
	onClose: noop,
	onEdit: noop,
	onDeviceUpdate: noop,
	hasSidebar: false,
	isModalWindow: false,
};

export default connect( null, { recordTracksEvent } )( localize( WebPreviewContent ) );
