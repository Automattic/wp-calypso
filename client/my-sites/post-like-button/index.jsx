/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import LikeButton from 'blocks/like-button';
import { getSiteSlug } from 'state/sites/selectors';

const PostLikeButton = props => <LikeButton { ...props } />;

export default connect(
	( state, { post } ) => ( { slug: getSiteSlug( state, post.site_ID ) } )
)( PostLikeButton );
