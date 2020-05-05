/**
 * External dependencies
 */

import { get, identity, noop, pick } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EditorFieldset from 'post-editor/editor-fieldset';
import FormCheckbox from 'components/forms/form-checkbox';
import InfoPopover from 'components/info-popover';
import ExternalLink from 'components/external-link';
import { recordEditorEvent, recordEditorStat } from 'state/posts/stats';
import { editPost } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId, isEditorNewPost } from 'state/ui/editor/selectors';
import { getSite } from 'state/sites/selectors';
import { getEditedPost } from 'state/posts/selectors';

/**
 * Style dependencies
 */
import './style.scss';

function booleanToStatus( bool ) {
	return bool ? 'open' : 'closed';
}

function statusToBoolean( status ) {
	return 'open' === status;
}

export class EditorDiscussion extends React.Component {
	static propTypes = {
		isNew: PropTypes.bool,
		post: PropTypes.object,
		site: PropTypes.object,
		translate: PropTypes.func.isRequired,
		recordEditorStat: PropTypes.func.isRequired,
		recordEditorEvent: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isNew: false,
		translate: identity,
		recordEditorStat: noop,
		recordEditorEvent: noop,
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
				ping_status: isPage ? 'closed' : booleanToStatus( defaultPingStatus ),
			};
		}

		return {};
	}

	onChange = ( event ) => {
		const discussion = pick( this.getDiscussionSetting(), 'comment_status', 'ping_status' );
		const newStatus = booleanToStatus( event.target.checked );
		const discussionType = event.target.name;
		let statName, gaEvent;

		discussion[ discussionType ] = newStatus;

		// There are other ways to construct these strings, but keeping them exactly as they are
		// displayed in mc/ga aids in discovery via grok
		if ( 'comment_status' === discussionType ) {
			statName = event.target.checked
				? 'advanced_comments_open_enabled'
				: 'advanced_comments_open_disabled';
			gaEvent = 'Comment status changed';
		} else {
			statName = event.target.checked
				? 'advanced_pings_open_enabled'
				: 'advanced_pings_open_disabled';
			gaEvent = 'Trackback status changed';
		}

		this.props.recordEditorStat( statName );
		this.props.recordEditorEvent( gaEvent, newStatus );

		const siteId = get( this.props.site, 'ID', null );
		const postId = get( this.props.post, 'ID', null );
		this.props.editPost( siteId, postId, { discussion } );
	};

	render() {
		const discussion = this.getDiscussionSetting();

		return (
			<EditorFieldset legend={ this.props.translate( 'Discussion' ) }>
				<label>
					<FormCheckbox
						name="comment_status"
						checked={ statusToBoolean( discussion.comment_status ) }
						disabled={ ! this.props.post }
						onChange={ this.onChange }
					/>
					<span>
						{ this.props.translate( 'Allow comments' ) }
						<InfoPopover
							position="top right"
							className="editor-discussion__info-bubble"
							gaEventCategory="Editor"
							popoverName="CommentStatus"
						>
							{ this.props.translate(
								'Provide a comment section to give readers the ability to respond.'
							) }
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
					<span>
						{ this.props.translate( 'Allow Pingbacks & Trackbacks' ) }
						<InfoPopover
							position="top right"
							className="editor-discussion__info-bubble"
							gaEventCategory="Editor"
							popoverName="PingStatus"
						>
							{ this.props.translate(
								'{{pingbacksLink}}Pingbacks{{/pingbacksLink}} and {{trackbacksLink}}trackbacks{{/trackbacksLink}} ' +
									'are automated comments you will receive when others create links to your post elsewhere.',
								{
									components: {
										pingbacksLink: (
											<ExternalLink
												href="https://wordpress.com/support/comments/pingbacks/"
												target="_blank"
												icon
											/>
										),
										trackbacksLink: (
											<ExternalLink
												href="https://wordpress.com/support/comments/trackbacks/"
												target="_blank"
												icon
											/>
										),
									},
								}
							) }
						</InfoPopover>
					</span>
				</label>
			</EditorFieldset>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const isNew = isEditorNewPost( state );
		const site = getSite( state, siteId );
		const post = getEditedPost( state, siteId, postId );

		return { site, post, isNew };
	},
	{ editPost, recordEditorStat, recordEditorEvent }
)( localize( EditorDiscussion ) );
