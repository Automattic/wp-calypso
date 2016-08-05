/** @ssr-ready **/

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import debugModule from 'debug';
import noop from 'lodash/noop';
import shallowCompare from 'react-addons-shallow-compare';

/**
 * Internal dependencies
 */
import Toolbar from './toolbar';
import touchDetect from 'lib/touch-detect';
import { isMobile } from 'lib/viewport';
import { localize } from 'i18n-calypso';
import Spinner from 'components/spinner';
import RootChild from 'components/root-child';
import SeoPreviewPane from 'components/seo-preview-pane';
import { setPreviewShowing } from 'state/ui/actions';

const debug = debugModule( 'calypso:web-preview' );

export class WebPreview extends Component {
	constructor( props ) {
		super( props );

		this._hasTouch = false;
		this._isMobile = false;

		this.state = {
			iframeUrl: null,
			device: props.defaultViewportDevice || 'computer',
			loaded: false
		};

		this.setIframeInstance = ref => this.iframe = ref;

		this.keyDown = this.keyDown.bind( this );
		this.setDeviceViewport = this.setDeviceViewport.bind( this );
		this.setIframeMarkup = this.setIframeMarkup.bind( this );
		this.setIframeUrl = this.setIframeUrl.bind( this );
		this.shouldRenderIframe = this.shouldRenderIframe.bind( this );
		this.setLoaded = this.setLoaded.bind( this );
	}

	componentWillMount() {
		// Cache touch and mobile detection for the entire lifecycle of the component
		this._hasTouch = touchDetect.hasTouch();
		this._isMobile = isMobile();
	}

	componentDidMount() {
		if ( this.props.previewUrl ) {
			this.setIframeUrl( this.props.previewUrl );
		}
		if ( this.props.previewMarkup ) {
			this.setIframeMarkup( this.props.previewMarkup );
		}
		if ( this.props.showPreview ) {
			document.documentElement.classList.add( 'no-scroll', 'is-previewing' );
		}
		this.props.setPreviewShowing( this.props.showPreview );
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return shallowCompare( this, nextProps, nextState );
	}

	componentDidUpdate( prevProps ) {
		const { showPreview, previewUrl } = this.props;

		this.setIframeUrl( previewUrl );

		if ( prevProps.showPreview !== showPreview ) {
			this.props.setPreviewShowing( showPreview );
		}

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
			document.documentElement.classList.add( 'no-scroll', 'is-previewing' );
		} else {
			window.removeEventListener( 'keydown', this.keyDown );
			document.documentElement.classList.remove( 'no-scroll', 'is-previewing' );
		}
	}

	componentWillUnmount() {
		this.props.setPreviewShowing( false );
		window.removeEventListener( 'keydown', this.keyDown );
		document.documentElement.classList.remove( 'no-scroll', 'is-previewing' );
	}

	keyDown( event ) {
		if ( event.keyCode === 27 ) {
			this.props.onClose();
			event.preventDefault();
		}
	}

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

	setIframeUrl( iframeUrl ) {
		// Bail if iframe isn't rendered
		if ( ! this.shouldRenderIframe() ) {
			return;
		}

		if ( ! this.iframe ) {
			return;
		}

		// Bail if we've already set this url
		if ( iframeUrl === this.state.iframeUrl ) {
			return;
		}

		debug( 'setIframeUrl', iframeUrl );
		this.iframe.contentWindow.location.replace( iframeUrl );
		this.setState( {
			loaded: false,
			iframeUrl: iframeUrl,
		} );
	}

	shouldRenderIframe() {
		// Don't preload iframe on mobile devices as bandwidth is typically more limited and
		// the preview causes weird issues
		return ! this._isMobile || this.props.showPreview;
	}

	setDeviceViewport( device = 'computer' ) {
		this.setState( { device } );
	}

	setLoaded() {
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
		this.setState( { loaded: true } );
	}

	render() {
		const { translate } = this.props;

		const className = classNames( this.props.className, 'web-preview', {
			'is-touch': this._hasTouch,
			'is-visible': this.props.showPreview,
			'is-computer': this.state.device === 'computer',
			'is-tablet': this.state.device === 'tablet',
			'is-phone': this.state.device === 'phone',
			'is-seo': this.state.device === 'seo',
			'is-loaded': this.state.loaded,
		} );

		return (
			<RootChild>
				<div className={ className }>
					<div className="web-preview__backdrop" onClick={ this.props.onClose } />
					<div className="web-preview__content">
						<Toolbar setDeviceViewport={ this.setDeviceViewport }
							device={ this.state.device }
							{ ...this.props }
							showExternal={ ( this.props.previewUrl ? this.props.showExternal : false ) }
							showDeviceSwitcher={ this.props.showDeviceSwitcher && ! this._isMobile }
							selectSeoPreview={ this.setDeviceViewport.bind( null, 'seo' ) }
						/>
						<div className="web-preview__placeholder">
							{ ! this.state.loaded && 'seo' !== this.state.device &&
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
									ref={ this.setIframeInstance }
									className="web-preview__frame"
									style={ { display: ('seo' === this.state.device ? 'none' : 'inherit') } }
									src="about:blank"
									onLoad={ this.setLoaded }
									title={ this.props.iframeTitle || translate( 'Preview' ) }
								/>
							}
							{ 'seo' === this.state.device &&
								<SeoPreviewPane />
							}
						</div>
					</div>
				</div>
			</RootChild>
		);
	}
}

WebPreview.propTypes = {
	// Display the preview
	showPreview: PropTypes.bool,
	// Show external link button (only if there is a previewUrl)
	showExternal: PropTypes.bool,
	// Show close button
	showClose: PropTypes.bool,
	// Show device viewport switcher
	showDeviceSwitcher: PropTypes.bool,
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
	// Called when the preview is closed, either via the 'X' button or the escape key
	onClose: PropTypes.func,
	// Optional loading message to display during loading
	loadingMessage: PropTypes.string,
	// The iframe's title element, used for accessibility purposes
	iframeTitle: PropTypes.string
};

WebPreview.defaultProps = {
	showExternal: true,
	showClose: true,
	showDeviceSwitcher: true,
	previewUrl: null,
	previewMarkup: null,
	onLoad: noop,
	onClose: noop
};

export default connect( null, { setPreviewShowing } )( localize( WebPreview ) );
