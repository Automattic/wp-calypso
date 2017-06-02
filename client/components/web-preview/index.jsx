/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import noop from 'lodash/noop';
import shallowCompare from 'react-addons-shallow-compare';

/**
 * Internal dependencies
 */
import touchDetect from 'lib/touch-detect';
import { isMobile } from 'lib/viewport';
import { localize } from 'i18n-calypso';
import RootChild from 'components/root-child';
import { setPreviewShowing } from 'state/ui/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import WebPreviewContent from './content';

export class WebPreview extends Component {
	constructor( props ) {
		super( props );

		this._hasTouch = false;
		this._isMobile = false;

		this.state = {
			device: props.defaultViewportDevice || 'computer',
		};

		this.keyDown = this.keyDown.bind( this );
		this.setDeviceViewport = this.setDeviceViewport.bind( this );
	}

	componentWillMount() {
		// Cache touch and mobile detection for the entire lifecycle of the component
		this._hasTouch = touchDetect.hasTouch();
		this._isMobile = isMobile();
	}

	componentDidMount() {
		if ( this.props.showPreview ) {
			document.documentElement.classList.add( 'no-scroll', 'is-previewing' );
		}
		this.props.setPreviewShowing( this.props.showPreview );
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return shallowCompare( this, nextProps, nextState );
	}

	componentDidUpdate( prevProps ) {
		const { showPreview } = this.props;

		// add/remove listener if showPreview has changed
		if ( showPreview === prevProps.showPreview ) {
			return;
		}
		this.props.setPreviewShowing( showPreview );
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

	setDeviceViewport( device = 'computer' ) {
		this.setState( { device } );
	}

	render() {
		const className = classNames( this.props.className, 'web-preview', {
			'is-touch': this._hasTouch,
			'is-with-sidebar': this.props.hasSidebar,
			'is-visible': this.props.showPreview,
			'is-computer': this.state.device === 'computer',
			'is-tablet': this.state.device === 'tablet',
			'is-phone': this.state.device === 'phone',
			'is-seo': this.state.device === 'seo',
		} );

		return (
			<RootChild>
				<div className={ className }>
					<div className="web-preview__backdrop" onClick={ this.props.onClose } />
					<div className="web-preview__content">
						<WebPreviewContent
							{ ...this.props }
							onDeviceUpdate={ this.setDeviceViewport }
						/>
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
	// Show SEO button
	showSEO: PropTypes.bool,
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
	iframeTitle: PropTypes.string,
	// Makes room for a sidebar if desired
	hasSidebar: React.PropTypes.bool,
};

WebPreview.defaultProps = {
	showExternal: true,
	showClose: true,
	showSEO: true,
	showDeviceSwitcher: true,
	previewUrl: null,
	previewMarkup: null,
	onLoad: noop,
	onClose: noop,
	hasSidebar: false,
};

export default connect( null, { recordTracksEvent, setPreviewShowing } )( localize( WebPreview ) );
