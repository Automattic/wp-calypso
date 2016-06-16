/**
 * External dependencies
 */
const React = require( 'react' );

/**
 * Internal dependencies
 */
const EditorFieldset = require( 'post-editor/editor-fieldset' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	PostActions = require( 'lib/posts/actions' ),
	stats = require( 'lib/posts/stats' );

export default React.createClass( {
	displayName: 'SharingLikeOptions',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		isSharingButtonsEnabled: React.PropTypes.bool,
		isLikesEnabled: React.PropTypes.bool,
		isNew: React.PropTypes.bool
	},

	isShowingSharingButtons: function() {
		if ( this.props.post && 'sharing_enabled' in this.props.post ) {
			return this.props.post.sharing_enabled;
		}

		if ( this.props.site && this.props.isNew ) {
			return this.props.site.options.default_sharing_status;
		}

		return true;
	},

	isShowingLikeButton: function() {
		if ( this.props.post && 'likes_enabled' in this.props.post ) {
			return this.props.post.likes_enabled;
		}

		if ( this.props.site && this.props.isNew ) {
			return this.props.site.options.default_likes_enabled;
		}

		return true;
	},

	renderSharingButtonField() {
		if ( ! this.props.isSharingButtonsEnabled ) {
			return;
		}

		return (
			<label>
				<FormCheckbox
					name='sharing_enabled'
					checked={ this.isShowingSharingButtons() }
					onChange={ this.onChange } />
				<span>{ this.translate( 'Show Sharing Buttons', { context: 'Post Editor' } ) }</span>
			</label>
		);
	},

	renderLikesButtonField() {
		if ( ! this.props.isLikesEnabled ) {
			return;
		}

		return (
				<label>
					<FormCheckbox
						name='likes_enabled'
						checked={ this.isShowingLikeButton() }
						onChange={ this.onChange } />
					<span>{ this.translate( 'Show Like Button', { context: 'Post Editor' } ) }</span>
				</label>
		);
	},

	onChange: function( event ) {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			[ event.target.name ]: event.target.checked
		} );

		this.recordStats( event );
	},

	recordStats: function( event ) {
		let mcStat = event.target.name,
			eventStat = 'sharing_enabled' === event.target.name ? 'Sharing Buttons' : 'Like Button';

		mcStat += event.target.checked ? '_enabled' : '_disabled';
		eventStat += event.target.checked ? ' Enabled' : ' Disabled';

		stats.recordStat( mcStat );
		stats.recordEvent( eventStat );
	},

	render: function() {
		return (
			<EditorFieldset
				className="editor-sharing__sharing-like-options"
				legend={ this.translate( 'Sharing Buttons & Likes' ) }
			>
				{ this.renderSharingButtonField() }
				{ this.renderLikesButtonField() }
			</EditorFieldset>
		);
	}
} );
