/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import InfoPopover from 'components/info-popover';
import { urlToDomainAndPath } from 'lib/url';
import { getSite } from 'state/sites/selectors';
import { saveSiteSettings } from 'state/site-settings/actions';
import { successNotice } from 'state/notices/actions';
import { canCurrentUser } from 'state/selectors';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';

export class CommentDetailAuthorMoreInfo extends Component {
	showBlockUser = () =>
		this.props.canUserBlacklist &&
		!! this.props.authorEmail &&
		this.props.authorEmail !== this.props.currentUserEmail;

	toggleBlockUser = () => {
		const {
			authorEmail,
			authorId,
			authorIsBlocked,
			commentId,
			showNotice,
			siteBlacklist,
			translate,
			updateBlacklist,
		} = this.props;

		const noticeOptions = {
			duration: 5000,
			id: `comment-notice-${ commentId }`,
			isPersistent: true,
		};

		const analytics = {
			action: authorIsBlocked ? 'unblock_user' : 'block_user',
			user_type: authorId ? 'wpcom' : 'email_only',
		};

		if ( authorIsBlocked ) {
			showNotice(
				translate( 'User %(email)s unblocked.', { args: { email: authorEmail } } ),
				noticeOptions
			);

			const newBlacklist = siteBlacklist
				.split( '\n' )
				.filter( item => item !== authorEmail )
				.join( '\n' );

			return updateBlacklist( newBlacklist, analytics );
		}

		showNotice(
			translate( 'User %(email)s is blocked and can no longer comment on your site.', {
				args: { email: authorEmail },
			} ),
			noticeOptions
		);

		const newBlacklist = !! siteBlacklist ? siteBlacklist + '\n' + authorEmail : authorEmail;

		return updateBlacklist( newBlacklist, analytics );
	};

	render() {
		const {
			authorDisplayName,
			authorEmail,
			authorIp,
			authorIsBlocked,
			authorUrl,
			authorUsername,
			site,
			trackAnonymousModeration,
			translate,
		} = this.props;

		return (
			<InfoPopover
				className="comment-detail__author-more-info"
				iconSize={ 24 }
				position="bottom left"
			>
				<div className="comment-detail__author-more-element comment-detail__author-more-element-author">
					<Gridicon icon="user-circle" />
					<div className="comment-detail__author-info">
						<div className="comment-detail__author-name">
							<strong>
								<Emojify>{ authorDisplayName }</Emojify>
							</strong>
						</div>
						<div className="comment-detail__author-username">{ authorUsername }</div>
					</div>
				</div>
				<div className="comment-detail__author-more-element">
					<Gridicon icon="mail" />
					<span>{ authorEmail || <em>{ translate( 'No email address' ) }</em> }</span>
				</div>
				<div className="comment-detail__author-more-element">
					<Gridicon icon="link" />
					{ !! authorUrl && (
						<ExternalLink href={ authorUrl }>
							<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
						</ExternalLink>
					) }
					{ ! authorUrl && <em>{ translate( 'No website' ) }</em> }
				</div>
				<div className="comment-detail__author-more-element">
					<Gridicon icon="globe" />
					<span>{ authorIp || <em>{ translate( 'No IP address' ) }</em> }</span>
				</div>
				{ this.showBlockUser() && (
					<div className="comment-detail__author-more-element">
						<Button scary={ ! authorIsBlocked } onClick={ this.toggleBlockUser }>
							<span>
								{ authorIsBlocked ? translate( 'Unblock user' ) : translate( 'Block user' ) }
							</span>
						</Button>
					</div>
				) }
				{ ! authorEmail && (
					<div className="comment-detail__author-more-element comment-detail__author-more-element-block-anonymous-user">
						<span>
							{ translate(
								// eslint-disable-next-line max-len
								"Anonymous messages can't be blocked individually, but you can update your {{a}}settings{{/a}} to only allow comments from registered users.",
								{
									components: {
										a: (
											<a
												href={ `/settings/discussion/${ site.slug }` }
												onClick={ trackAnonymousModeration }
											/>
										),
									},
								}
							) }
						</span>
					</div>
				) }
			</InfoPopover>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	canUserBlacklist: canCurrentUser( state, siteId, 'manage_options' ),
	currentUserEmail: getCurrentUserEmail( state ),
	site: getSite( state, siteId ),
} );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	showNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
	updateBlacklist: ( blacklist_keys, analytics ) =>
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_comment_management_moderate_user', analytics ),
					bumpStat(
						'calypso_comment_management',
						'block_user' === analytics.action
							? 'comment_author_blocked'
							: 'comment_author_unblocked'
					)
				),
				saveSiteSettings( siteId, { blacklist_keys } )
			)
		),
	trackAnonymousModeration: () =>
		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_comment_management_moderate_user', {
					action: 'open_discussion_settings',
					user_type: 'anonymous',
				} ),
				bumpStat( 'calypso_comment_management', 'open_discussion_settings' )
			)
		),
} );

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( CommentDetailAuthorMoreInfo )
);
