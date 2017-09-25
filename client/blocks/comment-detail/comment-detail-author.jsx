/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { some } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
import { convertDateToUserLocation } from 'components/post-schedule/utils';
import { gmtOffset, timezone } from 'lib/site/utils';
import { urlToDomainAndPath } from 'lib/url';
import { bumpStat, composeAnalytics, recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import { successNotice } from 'state/notices/actions';
import { canCurrentUser } from 'state/selectors';
import { saveSiteSettings } from 'state/site-settings/actions';
import { getSite } from 'state/sites/selectors';

export class CommentDetailAuthor extends Component {
	static propTypes = {
		authorAvatarUrl: PropTypes.string,
		authorDisplayName: PropTypes.string,
		authorEmail: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		authorId: PropTypes.number,
		authorIp: PropTypes.string,
		authorIsBlocked: PropTypes.bool,
		authorUrl: PropTypes.string,
		authorUsername: PropTypes.string,
		canUserBlacklist: PropTypes.bool,
		commentDate: PropTypes.string,
		commentId: PropTypes.number,
		commentStatus: PropTypes.string,
		commentType: PropTypes.string,
		commentUrl: PropTypes.string,
		currentUserEmail: PropTypes.string,
		siteBlacklist: PropTypes.string,
		siteId: PropTypes.number,
		updateBlacklist: PropTypes.func,
	};

	state = {
		isExpanded: false,
	};

	toggleExpanded = () => {
		this.setState( { isExpanded: ! this.state.isExpanded } );
	};

	getFormattedDate = () => convertDateToUserLocation(
		( this.props.commentDate || new Date() ),
		timezone( this.props.site ),
		gmtOffset( this.props.site )
	).format( 'll LT' );

	showMoreInfo = () =>
		( 'comment' === this.props.commentType ) &&
		some( [ this.props.authorEmail, this.props.authorIp, this.props.authorUrl ] );

	toggleBlockUser = () => {
		const {
			authorEmail,
			authorId,
			authorIsBlocked,
			siteBlacklist,
			commentId,
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
			this.props.successNotice(
				translate( 'User %(email)s unblocked.', { args: { email: authorEmail } } ),
				noticeOptions,
			);

			const newBlacklist = siteBlacklist.split( '\n' ).filter( item => item !== authorEmail ).join( '\n' );

			return updateBlacklist( newBlacklist, analytics );
		}

		this.props.successNotice(
			translate( 'User %(email)s blocked.', { args: { email: authorEmail } } ),
			noticeOptions,
		);

		const newBlacklist = !! siteBlacklist
			? siteBlacklist + '\n' + authorEmail
			: authorEmail;

		return updateBlacklist( newBlacklist, analytics );
	}

	authorMoreInfo() {
		if ( ! this.showMoreInfo() ) {
			return null;
		}

		const {
			authorDisplayName,
			authorEmail,
			authorIp,
			authorIsBlocked,
			authorUrl,
			authorUsername,
			canUserBlacklist,
			currentUserEmail,
			site,
			trackAnonymousModeration,
			translate,
		} = this.props;

		const showBlockUser = canUserBlacklist && !! authorEmail && ( authorEmail !== currentUserEmail );

		return (
			<div className="comment-detail__author-more-info">
				<div className="comment-detail__author-more-actions">
					<div className="comment-detail__author-more-element comment-detail__author-more-element-author">
						<Gridicon icon="user-circle" />
						<div className="comment-detail__author-info">
							<div className="comment-detail__author-name">
								<strong>
									<Emojify>
										{ authorDisplayName }
									</Emojify>
								</strong>
							</div>
							<div className="comment-detail__author-username">
								{ authorUsername }
							</div>
						</div>
					</div>
					<div className="comment-detail__author-more-element">
						<Gridicon icon="mail" />
						<span>
							{ authorEmail || <em>{ translate( 'No email address' ) }</em> }
						</span>
					</div>
					<div className="comment-detail__author-more-element">
						<Gridicon icon="link" />
						{ !! authorUrl &&
							<ExternalLink href={ authorUrl }>
								<Emojify>
									{ urlToDomainAndPath( authorUrl ) }
								</Emojify>
							</ExternalLink>
						}
						{ ! authorUrl &&
							<em>{ translate( 'No website' ) }</em>
						}
					</div>
					<div className="comment-detail__author-more-element">
						<Gridicon icon="globe" />
						<span>
							{ authorIp || <em>{ translate( 'No IP address' ) }</em> }
						</span>
					</div>
					{ showBlockUser &&
						<div className="comment-detail__author-more-element comment-detail__author-more-element-block-user">
							<Button onClick={ this.toggleBlockUser }>
								<Gridicon icon="block" />
								<span>{ authorIsBlocked
									? translate( 'Unblock user' )
									: translate( 'Block user' )
								}</span>
							</Button>
						</div>
					}
					{ ! authorEmail &&
						<div className="comment-detail__author-more-element comment-detail__author-more-element-block-anonymous-user">
							<span>
								{ translate(
									// eslint-disable-next-line max-len
									"Anonymous messages can't be blocked individually, but you can update your {{a}}settings{{/a}} to only allow comments from registered users.",
									{ components: {
										a: <a href={ `/settings/discussion/${ site.slug }` } onClick={ trackAnonymousModeration } />,
									} }
								) }
							</span>
						</div>
					}
				</div>
			</div>
		);
	}

	render() {
		const {
			authorDisplayName,
			authorUrl,
			commentStatus,
			commentType,
			commentUrl,
			translate,
		} = this.props;
		const { isExpanded } = this.state;

		const classes = classNames( 'comment-detail__author', {
			'is-expanded': isExpanded,
		} );

		return (
			<div className={ classes }>
				<div className="comment-detail__author-preview">
					<div className="comment-detail__author-avatar">
						<div className="comment-detail__author-avatar">
							{ 'comment' === commentType &&
								<Gravatar user={ {
									avatar_URL: this.props.authorAvatarUrl,
									display_name: this.props.authorDisplayName,
								} } />
							}
							{ 'comment' !== commentType &&
								<Gridicon icon="link" size={ 24 } />
							}
						</div>
					</div>
					<div className="comment-detail__author-info">
						<div className="comment-detail__author-info-element comment-detail__author-name">
							<strong>
								<Emojify>
									{ authorDisplayName }
								</Emojify>
							</strong>
							<ExternalLink href={ authorUrl }>
								<Emojify>
									{ urlToDomainAndPath( authorUrl ) }
								</Emojify>
							</ExternalLink>
						</div>
						<ExternalLink
							className="comment-detail__author-info-element comment-detail__comment-date"
							href={ commentUrl }
						>
							{ this.getFormattedDate() }
						</ExternalLink>
					</div>

					<div className="comment-detail__author-preview-actions">
						{ 'unapproved' === commentStatus &&
							<div className="comment-detail__status-label is-unapproved">
								{ translate( 'Pending' ) }
							</div>
						}

						{ this.showMoreInfo() &&
							<a className="comment-detail__author-more-info-toggle" onClick={ this.toggleExpanded }>
								<Gridicon icon="info-outline" />
							</a>
						}
					</div>
				</div>
				{ this.authorMoreInfo() }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	canUserBlacklist: canCurrentUser( state, siteId, 'manage_options' ),
	currentUserEmail: getCurrentUserEmail( state ),
	site: getSite( state, siteId ),
} );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	successNotice: ( text, options ) => dispatch( successNotice( text, options ) ),
	updateBlacklist: ( blacklist_keys, analytics ) => dispatch( withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'calypso_comment_management_moderate_user', analytics ),
			bumpStat(
				'calypso_comment_management',
				'block_user' === analytics.action ? 'comment_author_blocked' : 'comment_author_unblocked'
			)
		),
		saveSiteSettings( siteId, { blacklist_keys } )
	) ),
	trackAnonymousModeration: () => dispatch( composeAnalytics(
		recordTracksEvent( 'calypso_comment_management_moderate_user', {
			action: 'open_discussion_settings',
			user_type: 'anonymous',
		} ),
		bumpStat( 'calypso_comment_management', 'open_discussion_settings' )
) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentDetailAuthor ) );
