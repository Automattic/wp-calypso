/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Emojify from 'calypso/components/emojify';
import ExternalLink from 'calypso/components/external-link';
import Popover from 'calypso/components/popover';
import { decodeEntities } from 'calypso/lib/formatting';
import { urlToDomainAndPath } from 'calypso/lib/url';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getSiteComment } from 'calypso/state/comments/selectors';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import isAuthorsEmailBlocked from 'calypso/state/selectors/is-authors-email-blocked';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export class CommentAuthorMoreInfo extends Component {
	static propTypes = {
		commentId: PropTypes.number,
	};

	state = {
		showPopover: false,
	};

	storePopoverButtonRef = ( button ) => ( this.popoverButton = button );

	closePopover = () => this.setState( { showPopover: false } );

	togglePopover = () => this.setState( ( { showPopover } ) => ( { showPopover: ! showPopover } ) );

	toggleBlockUser = () => {
		const {
			authorEmail,
			authorId,
			commentId,
			isAuthorBlocked,
			showNotice,
			blockedCommentAuthorKeys,
			siteId,
			translate,
			updateBlockedCommentAuthors,
		} = this.props;

		const noticeOptions = {
			duration: 5000,
			id: `comment-notice-${ commentId }`,
			isPersistent: true,
		};

		const analytics = {
			action: isAuthorBlocked ? 'unblock_user' : 'block_user',
			user_type: authorId ? 'wpcom' : 'email_only',
		};

		if ( isAuthorBlocked ) {
			const nextBlockedCommentAuthorKeys = blockedCommentAuthorKeys
				.split( '\n' )
				.filter( ( item ) => item !== authorEmail )
				.join( '\n' );

			updateBlockedCommentAuthors( siteId, nextBlockedCommentAuthorKeys, analytics );

			return showNotice(
				translate( 'User %(email)s unblocked.', { args: { email: authorEmail } } ),
				noticeOptions
			);
		}

		const nextBlockedCommentAuthorKeys = blockedCommentAuthorKeys
			? blockedCommentAuthorKeys + '\n' + authorEmail
			: authorEmail;

		updateBlockedCommentAuthors( siteId, nextBlockedCommentAuthorKeys, analytics );

		showNotice(
			translate( 'User %(email)s is blocked and can no longer comment on your site.', {
				args: { email: authorEmail },
			} ),
			noticeOptions
		);
	};

	render() {
		const {
			authorDisplayName,
			authorEmail,
			authorIp,
			authorUrl,
			authorUsername,
			isAuthorBlocked,
			showBlockUser,
			siteSlug,
			trackAnonymousModeration,
			translate,
		} = this.props;

		const { showPopover } = this.state;

		return (
			<div className="comment__author-more-info">
				<Button borderless onClick={ this.togglePopover } ref={ this.storePopoverButtonRef }>
					<Gridicon icon="info-outline" size={ 18 } />
					{ translate( 'User Info' ) }
				</Button>

				<Popover
					className="comment__author-more-info-popover"
					context={ this.popoverButton }
					isVisible={ showPopover }
					onClose={ this.closePopover }
					position="bottom"
				>
					<div className="comment__author-more-info-element">
						<Gridicon icon="user-circle" />
						<div>
							<div>
								<strong>{ authorDisplayName || translate( 'Anonymous' ) }</strong>
							</div>
							<div>{ authorUsername }</div>
						</div>
					</div>

					<div className="comment__author-more-info-element">
						<Gridicon icon="mail" />
						<div>
							{ !! authorEmail && (
								<ExternalLink href={ `mailto:${ authorEmail }` }>{ authorEmail }</ExternalLink>
							) }
							{ ! authorEmail && <em>{ translate( 'No email address' ) }</em> }
						</div>
					</div>

					<div className="comment__author-more-info-element">
						<Gridicon icon="link" />
						<div>
							{ !! authorUrl && (
								<ExternalLink href={ authorUrl }>
									<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
								</ExternalLink>
							) }
							{ ! authorUrl && <em>{ translate( 'No website' ) }</em> }
						</div>
					</div>

					<div className="comment__author-more-info-element">
						<Gridicon icon="globe" />
						<div>{ authorIp || <em>{ translate( 'No IP address' ) }</em> }</div>
					</div>

					{ showBlockUser && (
						<div className="comment__author-more-info-element">
							<Button onClick={ this.toggleBlockUser } scary={ ! isAuthorBlocked }>
								{ isAuthorBlocked ? translate( 'Unblock user' ) : translate( 'Block user' ) }
							</Button>
						</div>
					) }

					{ ! authorEmail && (
						<div>
							{ translate(
								"Anonymous messages can't be blocked individually, " +
									'but you can update your {{a}}settings{{/a}} to ' +
									'only allow comments from registered users.',
								{
									components: {
										a: (
											<a
												href={ `/settings/discussion/${ siteSlug }` }
												onClick={ trackAnonymousModeration }
											/>
										),
									},
								}
							) }
						</div>
					) }
				</Popover>
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );

	const authorDisplayName = decodeEntities( get( comment, 'author.name' ) );
	const authorEmail = get( comment, 'author.email' );

	const showBlockUser =
		canCurrentUser( state, siteId, 'manage_options' ) &&
		!! authorEmail &&
		authorEmail !== getCurrentUserEmail( state );

	return {
		authorDisplayName,
		authorEmail,
		authorId: get( comment, 'author.ID' ),
		authorIp: get( comment, 'author.ip_address' ),
		authorUsername: get( comment, 'author.nice_name' ),
		authorUrl: get( comment, 'author.URL', '' ),
		isAuthorBlocked: isAuthorsEmailBlocked( state, siteId, authorEmail ),
		showBlockUser,
		blockedCommentAuthorKeys: getSiteSetting( state, siteId, 'disallowed_keys' ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	showNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
	updateBlockedCommentAuthors: ( siteId, blockedCommentAuthorKeys, analytics ) =>
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
				saveSiteSettings( siteId, { disallowed_keys: blockedCommentAuthorKeys } )
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentAuthorMoreInfo ) );
