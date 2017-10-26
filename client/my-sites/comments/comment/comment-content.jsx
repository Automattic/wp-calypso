/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import AutoDirection from 'components/auto-direction';
import Emojify from 'components/emojify';
import { stripHTML, decodeEntities } from 'lib/formatting';
import { getPostTitle } from 'my-sites/comments/comment/utils';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

export const CommentContent = ( { commentContent, isExpanded, postId, postTitle, siteSlug } ) => (
	<div className="comment__content">
		{ ! isExpanded && (
			<div className="comment__content-preview">
				<AutoDirection>
					<Emojify>{ decodeEntities( stripHTML( commentContent ) ) }</Emojify>
				</AutoDirection>
			</div>
		) }

		{ isExpanded && (
			<div className="comment__content-full">
				<div className="comment__post">
					<a href={ `/comments/all/${ siteSlug }/${ postId }` }>{ postTitle }</a>
				</div>

				<AutoDirection>
					<Emojify>
						<div
							dangerouslySetInnerHTML={ { __html: commentContent } } //eslint-disable-line react/no-danger
						/>
					</Emojify>
				</AutoDirection>
			</div>
		) }
	</div>
);

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );

	return {
		commentContent: get( comment, 'content' ),
		postId: get( comment, 'post.ID' ),
		postTitle: getPostTitle( comment ),
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( CommentContent );
