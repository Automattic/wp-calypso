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
import Toolbar from './toolbar';
import touchDetect from 'lib/touch-detect';
import { isMobile } from 'lib/viewport';
import Spinner from 'components/spinner';

const debug = debugModule( 'calypso:web-preview' );

const WebPreview = React.createClass( {

	_hasTouch: false,
	_isMobile: false,

	propTypes: {
		// Display the preview
		showPreview: React.PropTypes.bool,
		// Show external link button (only if there is a previewUrl)
		showExternal: React.PropTypes.bool,
		// Show close button
		showClose: React.PropTypes.bool,
		// Show device viewport switcher
		showDeviceSwitcher: React.PropTypes.bool,
		// The URL that should be displayed in the iframe
		previewUrl: React.PropTypes.string,
		// The markup to display in the iframe
		previewMarkup: React.PropTypes.string,
		// The viewport device to show initially
		defaultViewportDevice: React.PropTypes.string,
		// Elements to render on the right side of the toolbar
		children: React.PropTypes.node,
		// The function to call when the iframe is loaded. Will be passed the iframe document object.
		// Only called if using previewMarkup.
		onLoad: React.PropTypes.func,
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
			previewUrl: null,
			previewMarkup: null,
			onLoad: noop,
			onClose: noop,
		}
	},

	getInitialState() {
		return {
			iframeUrl: null,
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
		if ( this.props.previewUrl ) {
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
				iframeUrl: null,
				loaded: false,
			} );
		}
		// If the previewMarkup changes, re-render the iframe contents
		if ( this.props.previewMarkup && this.props.previewMarkup !== prevProps.previewMarkup ) {
			this.setIframeMarkup( this.props.previewMarkup );
		}
		// If the previewMarkup is erased, remove the iframe contents
		if ( ! this.props.previewMarkup && prevProps.previewMarkup ) {
			debug( 'removing iframe contents' );
			this.setIframeMarkup( '' );
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
		this.refs.iframe.contentWindow.location.replace( iframeUrl );
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
		if ( ! this.state.iframeUrl && ! this.props.previewMarkup ) {
			debug( 'preview loaded, but nothing to show' );
			return;
		}
		if ( this.props.previewMarkup ) {
			debug( 'preview loaded with markup' );
			this.props.onLoad( this.refs.iframe.contentDocument );
		} else {
			debug( 'preview loaded for url:', this.state.iframeUrl );
		}
		this.setState( { loaded: true } );
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
						showExternal={ ( this.props.previewUrl ? this.props.showExternal : false ) }
						showDeviceSwitcher={ this.props.showDeviceSwitcher && ! this._isMobile }
					/>
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
								src="about:blank"
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
