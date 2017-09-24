/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { get, pick } from 'lodash';

/**
 * Internal dependencies
 */
const EditorFieldset = require( 'post-editor/editor-fieldset' );
const FormCheckbox = require( 'components/forms/form-checkbox' );
const PostActions = require( 'lib/posts/actions' );
const InfoPopover = require( 'components/info-popover' );
const stats = require( 'lib/posts/stats' );

function booleanToStatus( bool ) {
	return bool ? 'open' : 'closed';
}

function statusToBoolean( status ) {
	return 'open' === status;
}

class EditorDiscussion extends Component {

	static propTypes = {
		isNew: PropTypes.bool,
		post: PropTypes.object,
		site: PropTypes.object,
	};

	static defaultProps = {
		isNew: false,
	};

	getDiscussionSetting() {
		if ( this.props.post && this.props.post.discussion ) {
			return this.props.post.discussion;
		}

		if ( this.props.site && this.props.isNew && this.props.post ) {
			const { site } = this.props;
			const isPage = this.props.post.type === 'page';
			const defaultCommentStatus = get( site, 'options.default_comment_status', false );
			const defaultPingStatus = get( site, 'options.default_ping_status', false );

			return {
				comment_status: isPage ? 'closed' : booleanToStatus( defaultCommentStatus ),
				ping_status: isPage ? 'closed' : booleanToStatus( defaultPingStatus )
			};
		}

		return {};
	}

	onChange = ( event ) => {
		const discussion = pick( this.getDiscussionSetting(), 'comment_status', 'ping_status' );
		const newStatus = booleanToStatus( event.target.checked );
		const discussionType = event.target.name;
		let statName;
		let gaEvent;

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
	}

	render() {
		const { translate } = this.props;
		const discussion = this.getDiscussionSetting();

		return (
			<EditorFieldset legend={ translate( 'Discussion' ) }>
				<label>
					<FormCheckbox
						name="comment_status"
						checked={ statusToBoolean( discussion.comment_status ) }
						disabled={ ! this.props.post }
						onChange={ this.onChange } />
					<span>
						{ translate( 'Allow comments' ) }
						<InfoPopover position="top right" className="editor-comment_status__info" gaEventCategory="Editor" popoverName="CommentStatus">
							{ translate( 'Provide a comment section to give readers the ability to respond.' ) }
						</InfoPopover>
					</span>
				</label>
				<label>
					<FormCheckbox
						name="ping_status"
						checked={ statusToBoolean( discussion.ping_status ) }
						disabled={ ! this.props.post }
						onChange={ this.onChange }
					/>
					<span>{ translate( 'Allow Pingbacks & Trackbacks' ) }</span>
				</label>
			</EditorFieldset>
		);
	}
}

EditorDiscussion.displayName = 'EditorDiscussion';

export default localize( EditorDiscussion );
