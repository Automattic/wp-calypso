/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
import { convertDateToUserLocation } from 'components/post-schedule/utils';
import { gmtOffset, timezone } from 'lib/site/utils';
import { urlToDomainAndPath } from 'lib/url';
import { getSiteComment } from 'state/selectors';
import { getSite } from 'state/sites/selectors';
import { getAuthorDisplayName, getGravatarUser, getPostTitle } from './utils';

export const CommentAuthor = ( {
	authorAvatarUrl,
	authorDisplayName,
	authorUrl,
	commentDate,
	commentType,
	commentUrl,
	isExpanded,
	moment,
	postTitle,
	site,
} ) => {
	const gravatarUser = getGravatarUser( authorAvatarUrl, authorDisplayName );

	const localizedDate = convertDateToUserLocation(
		commentDate || moment(),
		timezone( site ),
		gmtOffset( site )
	);

	const formattedDate = localizedDate.format( 'll LT' );

	const relativeDate = moment()
		.subtract( 1, 'month' )
		.isBefore( localizedDate )
		? localizedDate.fromNow()
		: localizedDate.format( 'll' );

	return (
		<div className="comment__author">
			<div className="comment__author-avatar">
				{ 'comment' === commentType && <Gravatar user={ gravatarUser } /> }
				{ 'comment' !== commentType && <Gridicon icon="link" size={ 24 } /> }
			</div>

			<div className="comment__author-info">
				<div className="comment__author-info-element">
					<strong className="comment__author-name">
						<Emojify>{ authorDisplayName }</Emojify>
					</strong>
					{ ! isExpanded && (
						<div className="comment__post">
							<Gridicon icon="chevron-right" size={ 18 } />
							<span>{ postTitle }</span>
						</div>
					) }
				</div>

				<div className="comment__author-info-element">
					<div className="comment__date">
						{ isExpanded && <ExternalLink href={ commentUrl }>{ formattedDate }</ExternalLink> }
						{ ! isExpanded && <span>{ relativeDate }</span> }
					</div>
					<div className="comment__author-url">
						<span className="comment__author-url-separator">&middot;</span>
						{ isExpanded && (
							<ExternalLink href={ authorUrl }>
								<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
							</ExternalLink>
						) }
						{ ! isExpanded && (
							<span>
								<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
							</span>
						) }
					</div>
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = ( state, { commentId, siteId } ) => {
	const comment = getSiteComment( state, siteId, commentId );

	return {
		authorAvatarUrl: get( comment, 'author.avatar_URL' ),
		authorDisplayName: getAuthorDisplayName( comment ),
		authorUrl: get( comment, 'author.URL', '' ),
		commentDate: get( comment, 'date' ),
		commentType: get( comment, 'type', 'comment' ),
		commentUrl: get( comment, 'URL' ),
		postTitle: getPostTitle( comment ),
		site: getSite( state, siteId ),
	};
};

export default connect( mapStateToProps )( localize( CommentAuthor ) );
