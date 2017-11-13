/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
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
import { getSite } from 'state/sites/selectors';

export const CommentDetailAuthor = ( {
	authorAvatarUrl,
	authorDisplayName,
	authorEmail,
	authorId,
	authorIp,
	authorIsBlocked,
	authorUrl,
	authorUsername,
	commentDate,
	commentId,
	commentStatus,
	commentType,
	commentUrl,
	siteBlacklist,
	site,
	siteId,
	translate,
} ) => {
	const formattedDate = convertDateToUserLocation(
		commentDate || new Date(),
		timezone( site ),
		gmtOffset( site )
	).format( 'll LT' );

	const showMoreInfo = 'comment' === commentType && some( [ authorEmail, authorIp, authorUrl ] );

	return (
		<div className="comment-detail__author">
			<div className="comment-detail__author-preview">
				<div className="comment-detail__author-avatar">
					<div className="comment-detail__author-avatar">
						{ 'comment' === commentType && (
							<Gravatar
								user={ {
									avatar_URL: authorAvatarUrl,
									display_name: authorDisplayName,
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
						{ formattedDate }
					</ExternalLink>
				</div>

				<div className="comment-detail__author-preview-actions">
					{ 'unapproved' === commentStatus && (
						<div className="comment-detail__status-label is-unapproved">
							{ translate( 'Pending' ) }
						</div>
					) }

					{ showMoreInfo && (
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
};

const mapStateToProps = ( state, { siteId } ) => ( {
	site: getSite( state, siteId ),
} );

export default connect( mapStateToProps )( localize( CommentDetailAuthor ) );
