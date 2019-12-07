/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import { get, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import CommentLink from 'my-sites/comments/comment/comment-link';
import CommentPostLink from 'my-sites/comments/comment/comment-post-link';
import Emojify from 'components/emojify';
import ExternalLink from 'components/external-link';
import Gravatar from 'components/gravatar';
import Tooltip from 'components/tooltip';
import { decodeEntities } from 'lib/formatting';
import { urlToDomainAndPath } from 'lib/url';
import getSiteComment from 'state/selectors/get-site-comment';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export class CommentAuthor extends Component {
	static propTypes = {
		commentId: PropTypes.number,
		isBulkMode: PropTypes.bool,
		isPostView: PropTypes.bool,
	};

	state = {
		isLinkTooltipVisible: false,
	};

	shouldComponentUpdate = ( nextProps, nextState ) =>
		! isEqual( this.props, nextProps ) || ! isEqual( this.state, nextState );

	storeLinkIndicatorRef = icon => ( this.hasLinkIndicator = icon );

	hideLinkTooltip = () => this.setState( { isLinkTooltipVisible: false } );

	showLinkTooltip = () => this.setState( { isLinkTooltipVisible: true } );

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
			hasLink,
			isBulkMode,
			isPostView,
			moment,
			translate,
		} = this.props;
		const { isLinkTooltipVisible } = this.state;

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
					{ 'comment' === commentType && ! authorAvatarUrl && (
						<span className="comment__author-gravatar-placeholder" />
					) }
					{ 'comment' !== commentType && <Gridicon icon="link" size={ 24 } /> }
				</div>

				<div className="comment__author-info">
					<div className="comment__author-info-element">
						{ hasLink && (
							<span
								onMouseEnter={ this.showLinkTooltip }
								onMouseLeave={ this.hideLinkTooltip }
								ref={ this.storeLinkIndicatorRef }
							>
								<Gridicon icon="link" className="comment__author-has-link" size={ 18 } />
								<Tooltip
									context={ this.hasLinkIndicator }
									isVisible={ isLinkTooltipVisible }
									showOnMobile
								>
									{ translate( 'This comment contains links.' ) }
								</Tooltip>
							</span>
						) }
						<strong className="comment__author-name">
							<Emojify>{ authorDisplayName || translate( 'Anonymous' ) }</Emojify>
						</strong>
						{ isBulkMode && ! isPostView && <CommentPostLink { ...{ commentId, isBulkMode } } /> }
					</div>

					<div className="comment__author-info-element">
						<span className="comment__date">
							<CommentLink
								commentId={ commentId }
								href={ commentUrl }
								tabIndex={ isBulkMode ? -1 : 0 }
								title={ formattedDate }
							>
								{ relativeDate }
							</CommentLink>
						</span>
						{ authorUrl && (
							<span className="comment__author-url">
								<span className="comment__author-url-separator">&middot;</span>
								<ExternalLink href={ authorUrl } tabIndex={ isBulkMode ? -1 : 0 }>
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
	const siteSlug = getSelectedSiteSlug( state );
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
		commentUrl: `/comment/${ siteSlug }/${ commentId }`,
		gravatarUser,
		hasLink: get( comment, 'has_link', false ),
	};
};

export default connect( mapStateToProps )( localize( CommentAuthor ) );
