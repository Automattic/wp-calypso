/**
 * External dependencies
 */
const React = require( 'react' ),
	pick = require( 'lodash/pick' );

/**
 * Internal dependencies
 */
const EditorFieldset = require( 'post-editor/editor-fieldset' ),
	FormCheckbox = require( 'components/forms/form-checkbox' ),
	PostActions = require( 'lib/posts/actions' ),
	InfoPopover = require( 'components/info-popover' ),
	stats = require( 'lib/posts/stats' );

function booleanToStatus( bool ) {
	return bool ? 'open' : 'closed';
}

function statusToBoolean( status ) {
	return 'open' === status;
}

export default React.createClass( {
	displayName: 'EditorDiscussion',

	propTypes: {
		isNew: React.PropTypes.bool,
		post: React.PropTypes.object,
		site: React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
			isNew: false
		};
	},

	getDiscussionSetting: function() {
		if ( this.props.post && this.props.post.discussion ) {
			return this.props.post.discussion;
		}

		if ( this.props.site && this.props.isNew ) {
			return {
				comment_status: booleanToStatus( this.props.site.options.default_comment_status ),
				ping_status: booleanToStatus( this.props.site.options.default_ping_status )
			};
		}

		return {};
	},

	onChange: function( event ) {
		var discussion = pick( this.getDiscussionSetting(), 'comment_status', 'ping_status' ),
			newStatus = booleanToStatus( event.target.checked ),
			discussionType = event.target.name,
			statName,
			gaEvent;

		discussion[ discussionType ] = newStatus;

		// There are other ways to construct these strings, but keeping them exactly as they are displayed in mc/ga aids in discovery via grok
		if ( 'comment_status' === discussionType ) {
			statName = event.target.checked ? 'advanced_comments_open_enabled' : 'advanced_comments_open_disabled';
			gaEvent = 'Comment status changed';
		} else {
			statName = event.target.checked ? 'advanced_pings_open_enabled' : 'advanced_pings_open_disabled';
			gaEvent = 'Trackback status changed';
		}

		stats.recordStat( statName );
		stats.recordEvent( gaEvent, newStatus );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.edit( {
			discussion: discussion
		} );
	},

	render: function() {
		var discussion = this.getDiscussionSetting();

		return (
			<EditorFieldset legend={ this.translate( 'Discussion' ) }>
				<label>
					<FormCheckbox
						name="comment_status"
						checked={ statusToBoolean( discussion.comment_status ) }
						disabled={ ! this.props.post }
						onChange={ this.onChange } />
					<span>
						{ this.translate( 'Allow comments' ) }
						<InfoPopover position="top right" className="editor-comment_status__info" gaEventCategory="Editor" popoverName="CommentStatus">
							{ this.translate( 'Provide a comment section to give readers the ability to respond.' ) }
						</InfoPopover>
					</span>
				</label>
				<label>
					<FormCheckbox
						name="ping_status"
						checked={ statusToBoolean( discussion.ping_status ) }
						disabled={ ! this.props.post }
						onChange={ this.onChange } />
					<span>{ this.translate( 'Allow Pingbacks & Trackbacks' ) }</span>
				</label>
			</EditorFieldset>
		);
	}
} );
