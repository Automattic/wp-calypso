/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
import { urlToDomainAndPath } from 'lib/url';
import { getSite } from 'state/sites/selectors';
import { convertDateToUserLocation } from 'components/post-schedule/utils';
import { gmtOffset, timezone } from 'lib/site/utils';
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

	getAuthorObject = () => ( {
		avatar_URL: this.props.authorAvatarUrl,
		display_name: this.props.authorDisplayName,
	} );

	getFormattedDate = () => convertDateToUserLocation(
		( this.props.commentDate || new Date() ),
		timezone( this.props.site ),
		gmtOffset( this.props.site )
	).format( 'll LT' );

	showMoreInfo = () => !! this.props.authorEmail || !! this.props.authorIp || !! this.props.authorUrl;

	toggleBlockUser = () => {
		const {
			authorEmail,
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

		if ( authorIsBlocked ) {
			this.props.successNotice(
				translate( 'User %(email)s unblocked.', { args: { email: authorEmail } } ),
				noticeOptions,
			);

			const newBlacklist = siteBlacklist.split( '\n' ).filter( item => item !== authorEmail ).join( '\n' );

			return updateBlacklist( newBlacklist, 'unblock' );
		}

		this.props.successNotice(
			translate( 'User %(email)s blocked.', { args: { email: authorEmail } } ),
			noticeOptions,
		);

		const newBlacklist = !! siteBlacklist
			? siteBlacklist + '\n' + authorEmail
			: authorEmail;

		return updateBlacklist( newBlacklist, 'block' );
	}

	authorMoreInfo() {
		if ( ! this.showMoreInfo() ) {
			return;
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
			translate,
		} = this.props;

		const showBlockUser = canUserBlacklist && !! authorEmail && ( authorEmail !== currentUserEmail );

		return (
			<div className="comment-detail__author-more-info">
				<div className="comment-detail__author-more-actions">
					<div className="comment-detail__author-more-element comment-detail__author-more-element-author">
						<Gravatar user={ this.getAuthorObject() } />
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
							{ authorEmail }
						</span>
					</div>
					<div className="comment-detail__author-more-element">
						<Gridicon icon="link" />
						<ExternalLink href={ authorUrl }>
							<Emojify>
								{ urlToDomainAndPath( authorUrl ) }
							</Emojify>
						</ExternalLink>
					</div>
					<div className="comment-detail__author-more-element">
						<Gridicon icon="globe" />
						<span>
							{ authorIp }
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
									"Anonymous messages can't be blocked individually, but you can update your {{a}}settings{{/a}} to allow comments only from registered users.",
									{ components: { a: <a href={ `/settings/discussion/${ site.slug }` } /> } }
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
					<Gravatar user={ this.getAuthorObject() } />
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
	updateBlacklist: ( blacklist_keys, action ) => dispatch( withAnalytics(
		composeAnalytics(
			recordTracksEvent( 'block' === action
				? 'calypso_comment_management_block_user'
				: 'calypso_comment_management_unblock_user'
			),
			bumpStat( 'calypso_comment_management', ( 'block' === action ? 'user_blocked' : 'user_unblocked' ) )
		),
		saveSiteSettings( siteId, { blacklist_keys } )
	) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( CommentDetailAuthor ) );
