/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { hasTouch } from './touch-detect';
import WebPreviewContent from './content';

/**
 * Style dependencies
 */
import './style.scss';

export class WebPreviewModal extends Component {
	static propTypes = {
		// Display the preview
		showPreview: PropTypes.bool,
		// The URL that should be displayed in the iframe
		previewUrl: PropTypes.string,
		// The markup to display in the iframe
		previewMarkup: PropTypes.string,
		// The default viewport device to show
		defaultViewportDevice: PropTypes.string,
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
		hasSidebar: PropTypes.bool,
		// Called on mount and when previewShow changes
		onPreviewShowChange: PropTypes.func,
		// Called after user switches device
		onDeviceUpdate: PropTypes.func,
		// Element to wrap the preview component
		Wrapper: PropTypes.oneOfType( [ PropTypes.func, PropTypes.symbol ] ),
		// Toolbar element to be rendered on top of the preview
		Toolbar: PropTypes.func,
	};

	static defaultProps = {
		defaultViewportDevice: 'computer',
		previewUrl: null,
		previewMarkup: null,
		onLoad: noop,
		onClose: noop,
		hasSidebar: false,
		onPreviewShowChange: noop,
		onDeviceUpdate: noop,
		Wrapper: Fragment,
	};

	constructor( props ) {
		super( props );

		this.state = {
			device: props.defaultViewportDevice,
		};

		this._hasTouch = false;

		this.setDevice = this.setDevice.bind( this );
		this.keyDown = this.keyDown.bind( this );
	}

	componentWillMount() {
		// Cache touch and mobile detection for the entire lifecycle of the component
		this._hasTouch = hasTouch();
	}

	componentDidMount() {
		const { onDeviceUpdate, onPreviewShowChange, showPreview } = this.props;

		if ( showPreview ) {
			document.documentElement.classList.add( 'no-scroll', 'is-previewing' );
		}

		onPreviewShowChange( showPreview );
		onDeviceUpdate( this.state.device );
	}

	componentDidUpdate( prevProps ) {
		const { onPreviewShowChange, showPreview } = this.props;

		// add/remove listener if showPreview has changed
		if ( showPreview === prevProps.showPreview ) {
			return;
		}

		onPreviewShowChange( showPreview );

		if ( showPreview ) {
			window.addEventListener( 'keydown', this.keyDown );
			document.documentElement.classList.add( 'no-scroll', 'is-previewing' );
		} else {
			window.removeEventListener( 'keydown', this.keyDown );
			document.documentElement.classList.remove( 'no-scroll', 'is-previewing' );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'keydown', this.keyDown );
		document.documentElement.classList.remove( 'no-scroll', 'is-previewing' );
	}

	keyDown( event ) {
		if ( event.keyCode === 27 ) {
			this.props.onClose();
			event.preventDefault();
		}
	}

	setDevice( device = 'computer' ) {
		this.props.onDeviceUpdate( device );
		this.setState( { device } );
	}

	render() {
		const {
			className,
			frontPageMetaDescription,
			hasSidebar,
			onClose,
			showPreview,
			Wrapper,
		} = this.props;
		const { device } = this.state;
		const classes = classNames( className, 'web-preview', `is-${ device }`, {
			'is-touch': this._hasTouch,
			'is-with-sidebar': hasSidebar,
			'is-visible': showPreview,
		} );

		return (
			<Wrapper>
				<div className={ classes }>
					{ /* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */ }
					<div className="web-preview__backdrop" onClick={ onClose } />
					{ /* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */ }
					<div className="web-preview__content">
						<WebPreviewContent
							{ ...this.props }
							device={ device }
							isModalWindow={ true }
							frontPageMetaDescription={ frontPageMetaDescription || null }
							setDevice={ this.setDevice }
						/>
					</div>
				</div>
			</Wrapper>
		);
	}
}

const WebPreviewInner = ( { isContentOnly, ...restProps } ) => {
	const WebPreviewComponent = isContentOnly ? WebPreviewContent : WebPreviewModal;

	return <WebPreviewComponent { ...restProps } />;
};

export default WebPreviewInner;
