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
import { decodeEntities } from 'lib/formatting';
import { urlToDomainAndPath } from 'lib/url';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

export class CommentAuthor extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		isExpanded: PropTypes.bool,
		isPostView: PropTypes.bool,
	};

	commentHasLink = () => {
		if ( typeof DOMParser !== 'undefined' && DOMParser.prototype.parseFromString ) {
			const parser = new DOMParser();
			const commentDom = parser.parseFromString( this.props.commentContent, 'text/html' );

			return !! commentDom.getElementsByTagName( 'a' ).length;
		}

		return false;
	};

	render() {
		const {
			authorAvatarUrl,
			authorDisplayName,
			authorUrl,
			commentDate,
			commentId,
			commentType,
			commentUrl,
			gravatarUser,
			isExpanded,
			isPostView,
			moment,
			translate,
		} = this.props;

		const formattedDate = moment( commentDate ).format( 'll LT' );

		const relativeDate = moment()
			.subtract( 1, 'month' )
			.isBefore( commentDate )
			? moment( commentDate ).fromNow()
			: moment( commentDate ).format( 'll' );

		return (
			<div className="comment__author">
				<div className="comment__author-avatar">
					{ /* A comment can be of type 'comment', 'pingback' or 'trackback'. */ }
					{ 'comment' === commentType && !! authorAvatarUrl && <Gravatar user={ gravatarUser } /> }
					{ 'comment' === commentType &&
						! authorAvatarUrl && <span className="comment__author-gravatar-placeholder" /> }
					{ 'comment' !== commentType && <Gridicon icon="link" size={ 24 } /> }
				</div>

				<div className="comment__author-info">
					<div className="comment__author-info-element">
						{ this.commentHasLink() && (
							<Gridicon icon="link" size={ 18 } className="comment__author-has-link" />
						) }
						<strong className="comment__author-name">
							<Emojify>{ authorDisplayName || translate( 'Anonymous' ) }</Emojify>
						</strong>
						{ ! isExpanded && ! isPostView && <CommentPostLink { ...{ commentId, isExpanded } } /> }
					</div>

					<div className="comment__author-info-element">
						<span className="comment__date">
							<ExternalLink href={ commentUrl } title={ formattedDate }>
								{ relativeDate }
							</ExternalLink>
						</span>
						{ authorUrl && (
							<span className="comment__author-url">
								<span className="comment__author-url-separator">&middot;</span>
								<ExternalLink href={ authorUrl }>
									<Emojify>{ urlToDomainAndPath( authorUrl ) }</Emojify>
								</ExternalLink>
							</span>
						) }
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );
	const authorAvatarUrl = get( comment, 'author.avatar_URL' );
	const authorDisplayName = decodeEntities( get( comment, 'author.name' ) );
	const gravatarUser = { avatar_URL: authorAvatarUrl, display_name: authorDisplayName };

	return {
		authorAvatarUrl,
		authorDisplayName,
		authorUrl: get( comment, 'author.URL', '' ),
		commentContent: get( comment, 'content' ),
		commentDate: get( comment, 'date' ),
		commentType: get( comment, 'type', 'comment' ),
		commentUrl: get( comment, 'URL' ),
		gravatarUser,
	};
};

export default connect( mapStateToProps )( localize( CommentAuthor ) );
