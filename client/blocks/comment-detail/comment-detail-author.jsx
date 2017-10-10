/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import CommentDetailAuthorMoreInfo from './comment-detail-author-more-info';
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
import { urlToDomainAndPath } from 'lib/url';
import { convertDateToUserLocation } from 'components/post-schedule/utils';
import { gmtOffset, timezone } from 'lib/site/utils';

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
		commentDate: PropTypes.string,
		commentId: PropTypes.number,
		commentStatus: PropTypes.string,
		commentType: PropTypes.string,
		commentUrl: PropTypes.string,
		siteBlacklist: PropTypes.string,
		siteId: PropTypes.number,
	};

	getFormattedDate = () =>
		convertDateToUserLocation(
			this.props.commentDate || new Date(),
			timezone( this.props.site ),
			gmtOffset( this.props.site )
		).format( 'll LT' );

	showMoreInfo = () =>
		'comment' === this.props.commentType &&
		some( [ this.props.authorEmail, this.props.authorIp, this.props.authorUrl ] );

	render() {
		const {
			authorDisplayName,
			authorEmail,
			authorId,
			authorIp,
			authorIsBlocked,
			authorUrl,
			authorUsername,
			commentId,
			commentStatus,
			commentType,
			commentUrl,
			siteBlacklist,
			siteId,
			translate,
		} = this.props;

		return (
			<div className="comment-detail__author">
				<div className="comment-detail__author-preview">
					<div className="comment-detail__author-avatar">
						<div className="comment-detail__author-avatar">
							{ 'comment' === commentType && (
								<Gravatar
									user={ {
										avatar_URL: this.props.authorAvatarUrl,
										display_name: this.props.authorDisplayName,
									} }
								/>
							) }
							{ 'comment' !== commentType && <Gridicon icon="link" size={ 24 } /> }
						</div>
					</div>
					<div className="comment-detail__author-info">
						<div className="comment-detail__author-info-element comment-detail__author-name">
							<strong>
								<Emojify>{ authorDisplayName }</Emojify>
							</strong>
							<ExternalLink href={ authorUrl }>
								<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
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
						{ 'unapproved' === commentStatus && (
							<div className="comment-detail__status-label is-unapproved">
								{ translate( 'Pending' ) }
							</div>
						) }

						{ this.showMoreInfo() && (
							<CommentDetailAuthorMoreInfo
								authorDisplayName={ authorDisplayName }
								authorEmail={ authorEmail }
								authorId={ authorId }
								authorIp={ authorIp }
								authorIsBlocked={ authorIsBlocked }
								authorUrl={ authorUrl }
								authorUsername={ authorUsername }
								commentId={ commentId }
								siteBlacklist={ siteBlacklist }
								siteId={ siteId }
							/>
						) }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( CommentDetailAuthor );
