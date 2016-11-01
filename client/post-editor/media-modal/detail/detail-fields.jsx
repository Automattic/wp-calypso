/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	debounce = require( 'lodash/debounce' ),
	assign = require( 'lodash/assign' ),
	debug = require( 'debug' )( 'calypso:editor-media-modal' ),
	connect = require( 'react-redux' ).connect;

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	MediaUtils = require( 'lib/media/utils' ),
	MediaActions = require( 'lib/media/actions' ),
	ClipboardButtonInput = require( 'components/clipboard-button-input' ),
	FormTextarea = require( 'components/forms/form-textarea' ),
	FormTextInput = require( 'components/forms/form-text-input' ),
	TrackInputChanges = require( 'components/track-input-changes' ),
	EditorMediaModalFieldset = require( '../fieldset' ),
	updateShortcodes = require( 'state/shortcodes/actions' ).updateShortcodes;

const EditorMediaModalDetailFields = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		item: React.PropTypes.object
	},

	getInitialState: function() {
		return {};
	},

	componentWillMount: function() {
		this.persistChange = debounce( this.persistChange, 1000 );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.item && nextProps.item && nextProps.item.ID !== this.props.item.ID ) {
			this.setState( {
				modifiedItem: null
			} );

			this.persistChange.cancel();
		}
	},

	bumpStat: function( stat ) {
		switch ( stat ) {
			case 'alt':
				analytics.ga.recordEvent( 'Media', 'Changed Image Alt' );
				break;

			case 'caption':
				analytics.ga.recordEvent( 'Media', 'Changed Item Caption' );
				break;

			case 'description':
				analytics.ga.recordEvent( 'Media', 'Changed Item Description' );
				break;
		}

		analytics.mc.bumpStat( 'calypso_media_edit_details', stat );
	},

	isMimePrefix: function( prefix ) {
		return MediaUtils.getMimePrefix( this.props.item ) === prefix;
	},

	persistChange: function() {
		if ( ! this.props.site || ! this.state.modifiedItem ) {
			return;
		}

		debug( 'Update media to %o', this.state.modifiedItem );
		MediaActions.update( this.props.site.ID, this.state.modifiedItem, false, this.props.updateShortcodes );
	},

	onChange: function( event ) {
		var modifiedItem = assign( {
			ID: this.props.item.ID
		}, this.state.modifiedItem, {
			[ event.target.name ]: event.target.value
		} );

		this.setState( {
			modifiedItem: modifiedItem
		} );

		this.persistChange();
	},

	getItemValue: function( attribute ) {
		if ( this.state.modifiedItem && attribute in this.state.modifiedItem ) {
			return this.state.modifiedItem[ attribute ];
		}

		if ( this.props.item ) {
			return this.props.item[ attribute ];
		}
	},

	scrollToShowVisibleDropdown: function( event ) {
		if ( ! event.open || ! ( 'scrollIntoView' in window.Element.prototype ) ) {
			return;
		}

		ReactDom.findDOMNode( event.target ).scrollIntoView();
	},

	renderImageAltText: function() {
		if ( ! this.isMimePrefix( 'image' ) ) {
			return;
		}

		return (
			<EditorMediaModalFieldset legend={ this.translate( 'Alt text' ) }>
				<TrackInputChanges onNewValue={ this.bumpStat.bind( this, 'alt' ) }>
					<FormTextInput name="alt" value={ this.getItemValue( 'alt' ) } onChange={ this.onChange } />
				</TrackInputChanges>
			</EditorMediaModalFieldset>
		);
	},

	render: function() {
		return (
			<div className="editor-media-modal-detail__fields">
				<EditorMediaModalFieldset legend={ this.translate( 'Caption' ) }>
					<TrackInputChanges onNewValue={ this.bumpStat.bind( this, 'caption' ) }>
						<FormTextarea name="caption" value={ this.getItemValue( 'caption' ) } onChange={ this.onChange } />
					</TrackInputChanges>
				</EditorMediaModalFieldset>
				{ this.renderImageAltText() }
				<EditorMediaModalFieldset legend={ this.translate( 'Description' ) }>
					<TrackInputChanges onNewValue={ this.bumpStat.bind( this, 'description' ) }>
						<FormTextInput name="description" value={ this.getItemValue( 'description' ) } onChange={ this.onChange } />
					</TrackInputChanges>
				</EditorMediaModalFieldset>
				<EditorMediaModalFieldset legend={ this.translate( 'URL' ) }>
					<ClipboardButtonInput value={ MediaUtils.url( this.props.item ) } />
				</EditorMediaModalFieldset>
			</div>
		);
	}
} );

export default connect(
	null,
	{
		updateShortcodes
	}
)( EditorMediaModalDetailFields );
