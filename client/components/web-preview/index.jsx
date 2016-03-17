/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import classnames from 'classnames';
import debugModule from 'debug';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Toolbar from './toolbar';
import touchDetect from 'lib/touch-detect';
import { isMobile } from 'lib/viewport';
import Spinner from 'components/spinner';
import { updatePreviewWithChanges } from 'lib/web-preview';

const debug = debugModule( 'calypso:web-preview' );

const WebPreview = React.createClass( {

	_hasTouch: false,
	_isMobile: false,

	propTypes: {
		// Display the preview
		showPreview: React.PropTypes.bool,
		// Show external link button
		showExternal: React.PropTypes.bool,
		// Show close button
		showClose: React.PropTypes.bool,
		// Show device viewport switcher
		showDeviceSwitcher: React.PropTypes.bool,
		// The URL that should be displayed in the iframe
		previewUrl: React.PropTypes.string,
		// The markup to display in the iframe
		previewMarkup: React.PropTypes.string,
		// Optional changes to make to the markup
		customizations: React.PropTypes.object,
		// False if customizations are unsaved
		isCustomizationsSaved: React.PropTypes.bool,
		// Actions we can take
		actions: React.PropTypes.object,
		// The viewport device to show initially
		defaultViewportDevice: React.PropTypes.string,
		// Elements to render on the right side of the toolbar
		children: React.PropTypes.node,
		// The function to call when the iframe is loaded. Will be passed the iframe document object.
		onLoad: React.PropTypes.func,
		// The function to call when an element is clicked. Will be passed the event.
		onClick: React.PropTypes.func,
		// Called when the preview is closed, either via the 'X' button or the escape key
		onClose: React.PropTypes.func,
		// Optional loading message to display during loading
		loadingMessage: React.PropTypes.string,
		// The iframe's title element, used for accessibility purposes
		iframeTitle: React.PropTypes.string
	},

	mixins: [ PureRenderMixin ],

	getDefaultProps() {
		return {
			showExternal: true,
			showClose: true,
			showDeviceSwitcher: true,
			previewMarkup: null,
			isCustomizationsSaved: true,
			onClick: noop,
			onLoad: noop,
			onClose: noop,
			previewUrl: 'about:blank'
		}
	},

	getInitialState() {
		return {
			iframeUrl: 'about:blank',
			device: this.props.defaultViewportDevice || 'computer',
			loaded: false
		};
	},

	componentWillMount() {
		// Cache touch and mobile detection for the entire lifecycle of the component
		this._hasTouch = touchDetect.hasTouch();
		this._isMobile = isMobile();
	},

	componentDidMount() {
		if ( this.props.previewUrl !== 'about:blank' ) {
			this.setIframeUrl( this.props.previewUrl );
		}
		if ( this.props.previewMarkup ) {
			this.setIframeMarkup( this.props.previewMarkup );
		}
		if ( this.props.showPreview ) {
			document.documentElement.classList.add( 'no-scroll' );
		}
	},

	componentDidUpdate( prevProps ) {
		const { showPreview, previewUrl } = this.props;

		this.setIframeUrl( previewUrl );

		if ( ! this.shouldRenderIframe() ) {
			this.setState( {
				iframeUrl: 'about:blank',
				loaded: false,
			} );
		}
		// If the previewMarkup changes, re-render the iframe contents
		if ( this.props.previewMarkup && this.props.previewMarkup !== prevProps.previewMarkup ) {
			this.setIframeMarkup( this.props.previewMarkup );
		}
		// If the customizations have been removed, restore the original markup
		if ( this.props.previewMarkup && this.props.customizations && this.props.previewMarkup === prevProps.previewMarkup && prevProps.customizations ) {
			if ( Object.keys( this.props.customizations ).length === 0 && Object.keys( prevProps.customizations ).length > 0 ) {
				debug( 'restoring original markup' );
				this.setIframeMarkup( this.props.previewMarkup );
			}
		}
		// If the previewMarkup is erased, remove the iframe contents
		if ( ! this.props.previewMarkup && prevProps.previewMarkup ) {
			debug( 'removing iframe contents' );
			this.setIframeMarkup( '' );
		}
		// Apply customizations
		if ( this.props.customizations && this.refs.iframe ) {
			debug( 'updating preview with customizations', this.props.customizations );
			updatePreviewWithChanges( this.refs.iframe.contentDocument, this.props.customizations );
		}

		// add/remove listener if showPreview has changed
		if ( showPreview === prevProps.showPreview ) {
			return;
		}
		if ( showPreview ) {
			window.addEventListener( 'keydown', this.keyDown );
			document.documentElement.classList.add( 'no-scroll' );
		} else {
			window.removeEventListener( 'keydown', this.keyDown );
			document.documentElement.classList.remove( 'no-scroll' );
		}
	},

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.keyDown );
		document.documentElement.classList.remove( 'no-scroll' );
	},

	keyDown( event ) {
		if ( event.keyCode === 27 ) {
			this.props.onClose();
			event.preventDefault();
		}
	},

	setIframeMarkup( content ) {
		if ( ! this.refs.iframe ) {
			debug( 'no iframe to update' );
			return;
		}
		debug( 'adding markup to iframe', content.length );
		this.refs.iframe.contentDocument.open();
		this.refs.iframe.contentDocument.write( content );
		this.refs.iframe.contentDocument.close();
	},

	handleClick( event ) {
		debug( 'click detected for element', event.target );
		return this.props.onClick( event );
	},

	setIframeUrl( iframeUrl ) {
		// Bail if iframe isn't rendered
		if ( ! this.shouldRenderIframe() ) {
			return;
		}

		// Bail if we've already set this url
		if ( iframeUrl === this.state.iframeUrl ) {
			return;
		}
		debug( 'setIframeUrl', iframeUrl );
		this.setState( {
			loaded: false,
			iframeUrl: iframeUrl,
		} );
	},

	shouldRenderIframe() {
		// Don't preload iframe on mobile devices as bandwidth is typically more limited and
		// the preview causes weird issues
		return ! this._isMobile || this.props.showPreview;
	},

	setDeviceViewport( device = 'computer' ) {
		this.setState( { device } );
	},

	setLoaded() {
		if ( this.state.iframeUrl === 'about:blank' && ! this.props.previewMarkup ) {
			debug( 'preview loaded, but nothing to show' );
			return;
		}
		debug( 'preview loaded:', this.state.iframeUrl );
		this.props.onLoad( this.refs.iframe.contentDocument );
		this.refs.iframe.contentDocument.body.onclick = this.handleClick;
		this.setState( { loaded: true } );
	},

	undoCustomization() {
		if ( this.props.actions.undoCustomization ) {
			this.props.actions.undoCustomization();
		}
	},

	saveCustomizations() {
		if ( this.props.actions.saveCustomizations ) {
			this.props.actions.saveCustomizations();
		}
	},

	renderToolBarButtons() {
		if ( this.props.customizations && this.props.actions.saveCustomizations ) {
			const saveButtonText = this.props.isCustomizationsSaved ? this.translate( 'Saved' ) : this.translate( 'Save & Publish' );
			return (
				<div>
					<Button compact onClick={ this.undoCustomization } >{ this.translate( 'Undo last change' ) }</Button>
					<Button compact primary disabled={ this.props.isCustomizationsSaved } onClick={ this.saveCustomizations } >{ saveButtonText }</Button>
				</div>
			);
		}
	},

	render() {
		const className = classnames( this.props.className, 'web-preview', {
			'is-touch': this._hasTouch,
			'is-visible': this.props.showPreview,
			'is-computer': this.state.device === 'computer',
			'is-tablet': this.state.device === 'tablet',
			'is-phone': this.state.device === 'phone',
			'is-loaded': this.state.loaded,
		} );

		return (
			<div className={ className }>
				<div className="web-preview__backdrop" onClick={ this.props.onClose } />
				<div className="web-preview__content">
					<Toolbar setDeviceViewport={ this.setDeviceViewport }
						device={ this.state.device }
						{ ...this.props }
						showDeviceSwitcher={ this.props.showDeviceSwitcher && ! this._isMobile }
					>
						{ this.renderToolBarButtons() }
					</Toolbar>
					<div className="web-preview__placeholder">
						{ ! this.state.loaded &&
							<div>
								<Spinner />
								{ this.props.loadingMessage &&
									<span className="web-preview__loading-message">
										{ this.props.loadingMessage }
									</span>
								}
							</div>
						}
						{ this.shouldRenderIframe() &&
							<iframe
								ref="iframe"
								className="web-preview__frame"
								src={ this.state.iframeUrl }
								onLoad={ this.setLoaded }
								title={ this.props.iframeTitle || this.translate( 'Preview' ) }
							/>
						}
					</div>
				</div>
			</div>
		);
	}
} );

export default WebPreview;
