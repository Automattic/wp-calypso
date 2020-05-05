/**
 * External dependencies
 */

import { filter, isEqual } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ButtonsPreviewButton from 'my-sites/marketing/buttons/preview-button';
import ResizableIframe from 'components/resizable-iframe';
import previewWidget from './preview-widget';
import { hasTouch } from 'lib/touch-detect';

class SharingButtonsPreviewButtons extends React.Component {
	static displayName = 'SharingButtonsPreviewButtons';

	static propTypes = {
		buttons: PropTypes.array,
		visibility: PropTypes.oneOf( [ 'hidden', 'visible' ] ),
		style: PropTypes.oneOf( [ 'icon', 'icon-text', 'text', 'official' ] ),
		onButtonClick: PropTypes.func,
		showMore: PropTypes.bool,
		forceMorePreviewVisible: PropTypes.bool,
	};

	static defaultProps = {
		buttons: Object.freeze( [] ),
		style: 'icon',
		onButtonClick: function () {},
		showMore: false,
		forceMorePreviewVisible: false,
	};

	state = {
		morePreviewOffset: null,
		morePreviewVisible: false,
	};

	componentDidMount() {
		this.maybeListenForWidgetMorePreview();
		this.updateMorePreviewVisibility();
		document.addEventListener( 'click', this.hideMorePreview );
	}

	componentDidUpdate( prevProps ) {
		this.maybeListenForWidgetMorePreview();

		if (
			prevProps.forceMorePreviewVisible !== this.props.forceMorePreviewVisible ||
			! isEqual( prevProps.buttons, this.props.buttons )
		) {
			// We trigger an update to the preview visibility if buttons have
			// changed to account for a change in visibility from hidden to
			// visible, or vice-versa
			this.updateMorePreviewVisibility();
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.detectWidgetPreviewChanges );
		document.removeEventListener( 'click', this.hideMorePreview );
	}

	maybeListenForWidgetMorePreview = () => {
		if ( 'official' === this.props.style && this.props.showMore ) {
			window.removeEventListener( 'message', this.detectWidgetPreviewChanges );
			window.addEventListener( 'message', this.detectWidgetPreviewChanges );
		}
	};

	detectWidgetPreviewChanges = ( event ) => {
		let preview, offset;

		// Ensure this only triggers in the context of an official preview
		if ( ! this.refs.iframe ) {
			return;
		}
		preview = ReactDom.findDOMNode( this.refs.iframe );

		// Parse the JSON message data
		let data;
		try {
			data = JSON.parse( event.data );
		} catch ( error ) {}

		if ( data && event.source === preview.contentWindow ) {
			if ( 'more-show' === data.action ) {
				offset = { top: preview.offsetTop, left: preview.offsetLeft };
				offset.top += data.rect.top + data.height;
				offset.left += data.rect.left;
				this.setState( {
					morePreviewOffset: offset,
					morePreviewVisible: true,
				} );
			} else if ( 'more-hide' === data.action ) {
				this.hideMorePreview();
			} else if ( 'more-toggle' === data.action ) {
				this.toggleMorePreview();
			} else if ( 'resize' === data.action ) {
				// If the frame size changes, we want to be sure to update the
				// more preview position if it's currently visible
				this.updateMorePreviewVisibility();
			}
		}
	};

	updateMorePreviewVisibility = () => {
		if ( ! this.props.forceMorePreviewVisible ) {
			this.hideMorePreview();
		} else {
			this.showMorePreview();
		}
	};

	showMorePreview = ( event ) => {
		let moreButton, offset;

		if ( event && ( event.currentTarget.contains( event.relatedTarget ) || hasTouch() ) ) {
			// Only allow the preview to be shown if cursor has moved from outside
			// the element to inside. This restriction should only apply to non-
			// touch devices
			return;
		}

		if ( 'official' === this.props.style ) {
			// To show the more preview when rendering official style buttons,
			// we request that the frame emit a show message with the offset
			ReactDom.findDOMNode( this.refs.iframe ).contentWindow.postMessage( 'more-show', '*' );
		} else {
			// For custom styles, we can calculate the offset using the
			// position of the rendered button
			moreButton = ReactDom.findDOMNode( this.refs.moreButton );
			offset = {
				top: moreButton.offsetTop + moreButton.clientHeight,
				left: moreButton.offsetLeft,
			};

			this.setState( {
				morePreviewOffset: offset,
				morePreviewVisible: true,
			} );
		}
	};

	toggleMorePreview = ( event ) => {
		if ( event ) {
			// Prevent document click handler from doubling or counteracting this
			// toggle action
			event.nativeEvent.stopImmediatePropagation();
		}

		if ( this.state.morePreviewVisible ) {
			this.hideMorePreview();
		} else {
			this.showMorePreview();
		}
	};

	hideMorePreview = () => {
		if ( ! this.props.forceMorePreviewVisible && this.state.morePreviewVisible ) {
			this.setState( { morePreviewVisible: false } );
		}
	};

	getOfficialPreviewElement = () => {
		// We filter by visibility for official buttons since we'll never need
		// to include the non-enabled icons in a preview. Non-enabled icons are
		// only needed in the button selection tray, where official buttons are
		// rendered in the text-only style.
		let buttons = filter( this.props.buttons, { visibility: this.props.visibility } ),
			previewUrl = previewWidget.generatePreviewUrlFromButtons( buttons, this.props.showMore );

		return (
			<ResizableIframe
				ref="iframe"
				src={ previewUrl }
				width="100%"
				frameBorder="0"
				className="official-preview"
			/>
		);
	};

	getCustomPreviewElement = () => {
		const buttons = this.props.buttons.map( function ( button ) {
			return (
				<ButtonsPreviewButton
					key={ button.ID }
					button={ button }
					enabled={ button.visibility === this.props.visibility }
					style={ this.props.style }
					onClick={ this.props.onButtonClick.bind( null, button ) }
				/>
			);
		}, this );

		if ( this.props.showMore ) {
			buttons.push(
				<ButtonsPreviewButton
					ref="moreButton"
					key="more"
					button={ {
						ID: 'more',
						name: this.props.translate( 'More' ),
						genericon: '\\f415',
					} }
					style={ 'icon' === this.props.style ? 'icon-text' : this.props.style }
					onMouseOver={ this.showMorePreview }
					onClick={ this.toggleMorePreview }
				/>
			);
		}

		return buttons;
	};

	getMorePreviewElement = () => {
		let classes, hiddenButtons;
		if ( ! this.props.showMore ) {
			return;
		}

		classes = classNames( 'sharing-buttons-preview-buttons__more', {
			'is-visible': this.state.morePreviewVisible,
		} );

		// The more preview is only ever used to show hidden buttons, so we
		// filter on the current set of buttons
		hiddenButtons = filter( this.props.buttons, { visibility: 'hidden' } );

		return (
			<div ref="more" className={ classes } style={ this.state.morePreviewOffset }>
				<div className="sharing-buttons-preview-buttons__more-inner">
					<SharingButtonsPreviewButtons
						buttons={ hiddenButtons }
						visibility="hidden"
						style={ this.props.style }
						showMore={ false }
					/>
				</div>
			</div>
		);
	};

	render() {
		return (
			<div className="sharing-buttons-preview-buttons">
				{ 'official' === this.props.style
					? this.getOfficialPreviewElement()
					: this.getCustomPreviewElement() }
				{ this.getMorePreviewElement() }
			</div>
		);
	}
}

export default localize( SharingButtonsPreviewButtons );
