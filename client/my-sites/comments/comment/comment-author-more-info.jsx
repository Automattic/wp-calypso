/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import InfoPopover from 'components/info-popover';
import { decodeEntities } from 'lib/formatting';
import { urlToDomainAndPath } from 'lib/url';
import {
	canCurrentUser,
	getSiteComment,
	getSiteSetting,
	isEmailBlacklisted,
} from 'state/selectors';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import { successNotice } from 'state/notices/actions';
import { saveSiteSettings } from 'state/site-settings/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export class CommentAuthorMoreInfo extends Component {
	static propTypes = {
		commentId: PropTypes.number,
	};

	storeLabelRef = label => ( this.authorMoreInfoLabel = label );

	storePopoverRef = popover => ( this.authorMoreInfoPopover = popover );

	openAuthorMoreInfoPopover = event => this.authorMoreInfoPopover.handleClick( event );

	toggleBlockUser = () => {
		const {
			authorEmail,
			authorId,
			commentId,
			isAuthorBlacklisted,
			showNotice,
			siteBlacklist,
			siteId,
			translate,
			updateBlacklist,
		} = this.props;

		const noticeOptions = {
			duration: 5000,
			id: `comment-notice-${ commentId }`,
			isPersistent: true,
		};

		const analytics = {
			action: isAuthorBlacklisted ? 'unblock_user' : 'block_user',
			user_type: authorId ? 'wpcom' : 'email_only',
		};

		if ( isAuthorBlacklisted ) {
			const newBlacklist = siteBlacklist
				.split( '\n' )
				.filter( item => item !== authorEmail )
				.join( '\n' );

			updateBlacklist( siteId, newBlacklist, analytics );

			return showNotice(
				translate( 'User %(email)s unblocked.', { args: { email: authorEmail } } ),
				noticeOptions
			);
		}

		const newBlacklist = !! siteBlacklist ? siteBlacklist + '\n' + authorEmail : authorEmail;

		updateBlacklist( siteId, newBlacklist, analytics );

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
			isAuthorBlacklisted,
			showBlockUser,
			siteSlug,
			trackAnonymousModeration,
			translate,
		} = this.props;

		return (
			<div
				className="comment__author-more-info"
				onClick={ this.openAuthorMoreInfoPopover }
				ref={ this.storeLabelRef }
			>
				<InfoPopover ignoreContext={ this.authorMoreInfoLabel } ref={ this.storePopoverRef }>
					<div className="comment__author-more-info-popover">
						<div className="comment__author-more-info-popover-element">
							<Gridicon icon="user-circle" />
							<div className="comment__author-more-info-popover-element-text">
								<div>
									<strong>{ authorDisplayName || translate( 'Anonymous' ) }</strong>
								</div>
								<div>{ authorUsername }</div>
							</div>
						</div>

						<div className="comment__author-more-info-popover-element">
							<Gridicon icon="mail" />
							<div className="comment__author-more-info-popover-element-text">
								{ authorEmail || <em>{ translate( 'No email address' ) }</em> }
							</div>
						</div>

						<div className="comment__author-more-info-popover-element">
							<Gridicon icon="link" />
							<div className="comment__author-more-info-popover-element-text">
								{ !! authorUrl && (
									<ExternalLink href={ authorUrl }>
										<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
									</ExternalLink>
								) }
								{ ! authorUrl && <em>{ translate( 'No website' ) }</em> }
							</div>
						</div>

						<div className="comment__author-more-info-popover-element">
							<Gridicon icon="globe" />
							<div className="comment__author-more-info-popover-element-text">
								{ authorIp || <em>{ translate( 'No IP address' ) }</em> }
							</div>
						</div>

						{ showBlockUser && (
							<div className="comment__author-more-info-popover-element">
								<Button onClick={ this.toggleBlockUser } scary={ ! isAuthorBlacklisted }>
									{ isAuthorBlacklisted ? translate( 'Unblock user' ) : translate( 'Block user' ) }
								</Button>
							</div>
						) }

						{ ! authorEmail && (
							<div className="comment__author-more-info-popover-element">
								{ translate(
									// eslint-disable-next-line max-len
									"Anonymous messages can't be blocked individually, but you can update your {{a}}settings{{/a}} to only allow comments from registered users.",
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
					</div>
				</InfoPopover>
				<label>{ translate( 'User Info' ) }</label>
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
		isAuthorBlacklisted: isEmailBlacklisted( state, siteId, authorEmail ),
		showBlockUser,
		siteBlacklist: getSiteSetting( state, siteId, 'blacklist_keys' ),
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
	};
};

const mapDispatchToProps = dispatch => ( {
	showNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
	updateBlacklist: ( siteId, blacklist_keys, analytics ) =>
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

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentAuthorMoreInfo ) );
