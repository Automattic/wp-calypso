/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	filter = require( 'lodash/filter' ),
	isEqual = require( 'lodash/isEqual' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var ButtonsPreviewButton = require( 'my-sites/sharing/buttons/preview-button' ),
	ResizableIframe = require( 'components/resizable-iframe' ),
	previewWidget = require( './preview-widget' ),
	touchDetect = require( 'lib/touch-detect' );

var SharingButtonsPreviewButtons = module.exports = React.createClass( {
	displayName: 'SharingButtonsPreviewButtons',

	propTypes: {
		buttons: React.PropTypes.array,
		visibility: React.PropTypes.oneOf( [ 'hidden', 'visible' ] ),
		style: React.PropTypes.oneOf( [ 'icon', 'icon-text', 'text', 'official' ] ),
		onButtonClick: React.PropTypes.func,
		showMore: React.PropTypes.bool,
		forceMorePreviewVisible: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			buttons: Object.freeze( [] ),
			style: 'icon',
			onButtonClick: function() {},
			showMore: false,
			forceMorePreviewVisible: false
		};
	},

	getInitialState: function() {
		return {
			morePreviewOffset: null,
			morePreviewVisible: false
		};
	},

	componentDidMount: function() {
		this.maybeListenForWidgetMorePreview();
		this.updateMorePreviewVisibility();
		document.addEventListener( 'click', this.hideMorePreview );
	},

	componentDidUpdate: function( prevProps ) {
		this.maybeListenForWidgetMorePreview();

		if ( prevProps.forceMorePreviewVisible !== this.props.forceMorePreviewVisible ||
				! isEqual( prevProps.buttons, this.props.buttons ) ) {
			// We trigger an update to the preview visibility if buttons have
			// changed to account for a change in visibility from hidden to
			// visible, or vice-versa
			this.updateMorePreviewVisibility();
		}
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'message', this.detectWidgetPreviewChanges );
		document.removeEventListener( 'click', this.hideMorePreview );
	},

	maybeListenForWidgetMorePreview: function() {
		if ( 'official' === this.props.style && this.props.showMore ) {
			window.removeEventListener( 'message', this.detectWidgetPreviewChanges );
			window.addEventListener( 'message', this.detectWidgetPreviewChanges );
		}
	},

	detectWidgetPreviewChanges: function( event ) {
		var preview, offset;

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
					morePreviewVisible: true
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
	},

	updateMorePreviewVisibility: function() {
		if ( ! this.props.forceMorePreviewVisible ) {
			this.hideMorePreview();
		} else {
			this.showMorePreview();
		}
	},

	showMorePreview: function( event ) {
		var moreButton, offset;

		if ( event && ( event.currentTarget.contains( event.relatedTarget ) || touchDetect.hasTouch() ) ) {
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
				left: moreButton.offsetLeft
			};

			this.setState( {
				morePreviewOffset: offset,
				morePreviewVisible: true
			} );
		}
	},

	toggleMorePreview: function( event ) {
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
	},

	hideMorePreview: function() {
		if ( ! this.props.forceMorePreviewVisible && this.state.morePreviewVisible ) {
			this.setState( { morePreviewVisible: false } );
		}
	},

	getOfficialPreviewElement: function() {
		// We filter by visibility for official buttons since we'll never need
		// to include the non-enabled icons in a preview. Non-enabled icons are
		// only needed in the button selection tray, where official buttons are
		// rendered in the text-only style.
		var buttons = filter( this.props.buttons, { visibility: this.props.visibility } ),
			previewUrl = previewWidget.generatePreviewUrlFromButtons( buttons, this.props.showMore );

		return <ResizableIframe ref="iframe" src={ previewUrl } width="100%" frameBorder="0" className="official-preview" />;
	},

	getCustomPreviewElement: function() {
		var buttons = this.props.buttons.map( function( button ) {
			return <ButtonsPreviewButton key={ button.ID } button={ button } enabled={ button.visibility === this.props.visibility } style={ this.props.style } onClick={ this.props.onButtonClick.bind( null, button ) } />;
		}, this );

		if ( this.props.showMore ) {
			buttons.push(
				<ButtonsPreviewButton
					ref="moreButton"
					key="more"
					button={ {
						ID: 'more',
						name: this.translate( 'More' ),
						genericon: '\\f415'
					} }
					style={ 'icon' === this.props.style ? 'icon-text' : this.props.style }
					onMouseOver={ this.showMorePreview }
					onClick={ this.toggleMorePreview } />
			);
		}

		return buttons;
	},

	getMorePreviewElement: function() {
		var classes, hiddenButtons;
		if ( ! this.props.showMore ) {
			return;
		}

		classes = classNames( 'sharing-buttons-preview-buttons__more', {
			'is-visible': this.state.morePreviewVisible
		} );

		// The more preview is only ever used to show hidden buttons, so we
		// filter on the current set of buttons
		hiddenButtons = filter( this.props.buttons, { visibility: 'hidden' } );

		return (
			<div ref="more" className={ classes } style={ this.state.morePreviewOffset }>
				<div className="sharing-buttons-preview-buttons__more-inner">
					<SharingButtonsPreviewButtons buttons={ hiddenButtons } visibility="hidden" style={ this.props.style } showMore={ false } />
				</div>
			</div>
		);
	},

	render: function() {
		return (
			<div className="sharing-buttons-preview-buttons">
				{ 'official' === this.props.style ? this.getOfficialPreviewElement() : this.getCustomPreviewElement() }
				{ this.getMorePreviewElement() }
			</div>
		);
	}
} );
