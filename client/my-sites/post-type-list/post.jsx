/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPost } from 'state/posts/selectors';
import Card from 'components/card';

function PostTypePost( { post } ) {
	return (
		<Card compact className="post-type-list__post">
			{ post.title }
		</Card>
	);
}

PostTypePost.propTypes = {
	globalId: PropTypes.string.isRequired,
	post: PropTypes.object
};

export default connect( ( state, ownProps ) => {
	return {
		post: getPost( state, ownProps.globalId )
	};
} )( PostTypePost );
