/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { hasTouch } from 'calypso/lib/touch-detect';
import { localize } from 'i18n-calypso';
import { RootChild } from '@automattic/components';
import { setPreviewShowing } from 'calypso/state/ui/actions';
import WebPreviewContent from './content';

/**
 * Style dependencies
 */
import './style.scss';

export class WebPreviewModal extends Component {
	static propTypes = {
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
		// Show edit the header link button
		showEditHeaderLink: PropTypes.bool,
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
		// Called when the preview is closed, either via the 'X' button or the escape key
		onClose: PropTypes.func,
		// Called when the edit button is clicked
		onEdit: PropTypes.func,
		// Optional loading message to display during loading
		loadingMessage: PropTypes.string,
		// The iframe's title element, used for accessibility purposes
		iframeTitle: PropTypes.string,
		// Makes room for a sidebar if desired
		hasSidebar: PropTypes.bool,
		// The site/post description passed to the SeoPreviewPane
		frontPageMetaDescription: PropTypes.string,
		// A post object used to override the selected post in the SEO preview
		overridePost: PropTypes.object,
	};

	static defaultProps = {
		showExternal: true,
		showClose: true,
		showSEO: true,
		showDeviceSwitcher: true,
		showEdit: false,
		editUrl: null,
		previewUrl: null,
		previewMarkup: null,
		onLoad: noop,
		onClose: noop,
		onEdit: noop,
		hasSidebar: false,
		overridePost: null,
	};

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

	UNSAFE_componentWillMount() {
		// Cache touch and mobile detection for the entire lifecycle of the component
		this._hasTouch = hasTouch();
		this._isMobile = isMobile();
	}

	componentDidMount() {
		if ( this.props.showPreview ) {
			document.documentElement.classList.add( 'no-scroll', 'is-previewing' );
		}
		this.props.setPreviewShowing( this.props.showPreview );
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
					{ /* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */ }
					<div className="web-preview__backdrop" onClick={ this.props.onClose } />
					{ /* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */ }
					<div className="web-preview__content">
						<WebPreviewContent
							{ ...this.props }
							onDeviceUpdate={ this.setDeviceViewport }
							isModalWindow
							frontPageMetaDescription={ this.props.frontPageMetaDescription || null }
						/>
					</div>
				</div>
			</RootChild>
		);
	}
}

const ConnectedWebPreviewModal = connect( null, { setPreviewShowing } )(
	localize( WebPreviewModal )
);

const WebPreviewInner = ( { isContentOnly, ...restProps } ) => {
	const WebPreviewComponent = isContentOnly ? WebPreviewContent : ConnectedWebPreviewModal;

	return <WebPreviewComponent { ...restProps } />;
};

export default WebPreviewInner;
