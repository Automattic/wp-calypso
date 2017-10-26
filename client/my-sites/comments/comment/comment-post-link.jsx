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
import { decodeEntities } from 'lib/formatting';
import { getSiteComment } from 'state/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

const CommentPostLink = ( { siteSlug, postId, postTitle, translate } ) => (
	<div className="comment__post-link">
		<Gridicon icon="chevron-right" size={ 18 } />
		<a href={ `/comments/all/${ siteSlug }/${ postId }` }>
			{ postTitle || translate( 'Untitled' ) }
		</a>
	</div>
);

const mapStateToProps = ( state, { commentId } ) => {
	const siteId = getSelectedSiteId( state );
	const comment = getSiteComment( state, siteId, commentId );

	return {
		postId: get( comment, 'post.ID' ),
		postTitle: decodeEntities( get( comment, 'post.title' ) ),
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( localize( CommentPostLink ) );
