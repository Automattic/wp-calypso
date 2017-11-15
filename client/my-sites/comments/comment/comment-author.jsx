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
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
import CommentPostLink from 'my-sites/comments/comment/comment-post-link';
import { convertDateToUserLocation } from 'components/post-schedule/utils';
import { decodeEntities } from 'lib/formatting';
import { gmtOffset, timezone } from 'lib/site/utils';
import { urlToDomainAndPath } from 'lib/url';
import { getSiteComment } from 'state/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

export class CommentAuthor extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		isExpanded: PropTypes.bool,
	};

	render() {
		const {
			authorDisplayName,
			authorUrl,
			commentDate,
			commentId,
			commentType,
			commentUrl,
			gravatarUser,
			isExpanded,
			moment,
			site,
			translate,
		} = this.props;

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
					{ /* A comment can be of type 'comment', 'pingback' or 'trackback'. */ }
					{ 'comment' === commentType && <Gravatar user={ gravatarUser } /> }
					{ 'comment' !== commentType && <Gridicon icon="link" size={ 24 } /> }
				</div>

				<div className="comment__author-info">
					<div className="comment__author-info-element">
						<strong className="comment__author-name">
							<Emojify>{ authorDisplayName || translate( 'Anonymous' ) }</Emojify>
						</strong>
						{ ! isExpanded && <CommentPostLink { ...{ commentId } } /> }
					</div>

					<div className="comment__author-info-element">
						<span className="comment__date">
							<ExternalLink href={ commentUrl }>
								{ isExpanded ? formattedDate : relativeDate }
							</ExternalLink>
						</span>
						<span className="comment__author-url">
							<span className="comment__author-url-separator">&middot;</span>
							<ExternalLink href={ authorUrl }>
								<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
							</ExternalLink>
						</span>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );

	const authorAvatarUrl = get( comment, 'author.avatar_URL' );
	const authorDisplayName = decodeEntities( get( comment, 'author.name' ) );
	const gravatarUser = { avatar_URL: authorAvatarUrl, display_name: authorDisplayName };

	return {
		authorAvatarUrl,
		authorDisplayName,
		authorUrl: get( comment, 'author.URL', '' ),
		commentDate: get( comment, 'date' ),
		commentType: get( comment, 'type', 'comment' ),
		commentUrl: get( comment, 'URL' ),
		gravatarUser,
		site,
	};
};

export default connect( mapStateToProps )( localize( CommentAuthor ) );
