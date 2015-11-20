/**
 * External dependencies
 */
import React from 'react/addons';
import classnames from 'classnames';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Toolbar from './toolbar';
import touchDetect from 'lib/touch-detect';
import { isMobile } from 'lib/viewport';

const debug = debugModule( 'calypso:web-preview' );

const WebPreview = React.createClass( {

	_hasTouch: false,
	_isMobile: false,

	propTypes: {
		// Display the preview
		showPreview: React.PropTypes.bool,
		// Show external link button
		showExternal: React.PropTypes.bool,
		// Show device viewport switcher
		showDeviceSwitcher: React.PropTypes.bool,
		// The URL that should be displayed in the iframe
		previewUrl: React.PropTypes.string,
		// The viewport device to show initially
		defaultViewportDevice: React.PropTypes.string,
		// Elements to render on the right side of the toolbar
		children: React.PropTypes.node,
		// Called when the preview is closed, either via the 'X' button or the escape key
		onClose: React.PropTypes.func,
		// Loading message to display along with placeholder
		loadingMessage: React.PropTypes.string,
	},

	mixins: [ React.addons.PureRenderMixin ],

	getDefaultProps() {
		return {
			showExternal: true,
			showDeviceSwitcher: true,
			previewUrl: 'about:blank',
			loadingMessage: ''
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

		// add/remove listener if showPreview has changed
		if ( showPreview === prevProps.showPreview ) {
			return;
		}
		if ( showPreview ) {
			window.addEventListener( 'keydown', this.keyDown );
		} else {
			window.removeEventListener( 'keydown', this.keyDown );
		}
	},

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.keyDown );
	},

	keyDown( event ) {
		if ( event.keyCode === 27 ) {
			this.props.onClose();
			event.preventDefault();
		}
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
		if ( this.state.iframeUrl === 'about:blank' ) {
			return;
		}
		debug( 'preview loaded:', this.state.iframeUrl );
		this.setState( { loaded: true } );
	},

	render() {
		const className = classnames( 'web-preview', {
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
					/>
					<div className="web-preview__placeholder">
						{ ! this.state.loaded && this.props.loadingMessage }
						{ this.shouldRenderIframe() &&
							<iframe
								className="web-preview__frame"
								src={ this.state.iframeUrl }
								onLoad={ this.setLoaded }
							/>
						}
					</div>
				</div>
			</div>
		);
	}
} );

export default WebPreview;
