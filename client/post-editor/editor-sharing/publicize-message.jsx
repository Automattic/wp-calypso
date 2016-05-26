/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const CountedTextarea = require( 'components/forms/counted-textarea' ),
	FormTextarea = require( 'components/forms/form-textarea' ),
	PostActions = require( 'lib/posts/actions' ),
	stats = require( 'lib/posts/stats' ),
	TrackInputChanges = require( 'components/track-input-changes' ),
	InfoPopover = require( 'components/info-popover' );

export default React.createClass( {
	displayName: 'PublicizeMessage',

	propTypes: {
		message: React.PropTypes.string,
		preview: React.PropTypes.string,
		acceptableLength: React.PropTypes.number,
		requireCount: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return {
			message: '',
			acceptableLength: 140,
			requireCount: false,
		};
	},

	onChange: function( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.updateMetadata( '_wpas_mess', event.target.value );
	},

	recordStats: function() {
		stats.recordStat( 'sharing_message_changed' );
		stats.recordEvent( 'Publicize Sharing Message Changed' );
	},

	renderInfoPopover: function() {
		return (
			<InfoPopover
				className="publicize-message-counter-info"
				position="bottom left"
				gaEventCategory="Editor"
				popoverName="SharingMessage"
			>
				{ this.translate(
					'The length includes space for the link to your post and an attached image.',
					{ context: 'Post editor sharing message counter explanation' }
			) }
			</InfoPopover>
		);
	},

	renderTextarea: function() {
		if ( this.props.requireCount ) {
			return (
				<CountedTextarea
					value={ this.props.message }
					placeholder={ this.props.preview }
					countPlaceholderLength={ true }
					onChange={ this.onChange }
					showRemainingCharacters={ true }
					acceptableLength={ this.props.acceptableLength }
					className="editor-sharing__message-input"
				>
					{ this.renderInfoPopover() }
				</CountedTextarea>
			);
		} else {
			return (
				<FormTextarea
					value={ this.props.message }
					placeholder={ this.props.preview }
					onChange={ this.onChange }
					className="editor-sharing__message-input"/>
			);
		}
	},

	render: function() {
		return (
			<div className="editor-sharing__publicize-message">
				<h5 className="editor-sharing__message-heading">
					{ this.translate( 'Customize the message', { context: 'Post editor sharing message heading' } ) }
				</h5>
				<TrackInputChanges onNewValue={ this.recordStats }>
					{ this.renderTextarea() }
				</TrackInputChanges>
			</div>
		);
	}
} );
