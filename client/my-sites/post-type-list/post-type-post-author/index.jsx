/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPost } from 'state/posts/selectors';

function PostTypePostAuthor( { name } ) {
	if ( ! name ) {
		return null;
	}

	return (
		<div className="post-type-post-author">
			<div className="post-type-post-author__name">
				{ name }
			</div>
		</div>
	);
}

PostTypePostAuthor.propTypes = {
	globalId: PropTypes.string,
	name: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const post = getPost( state, ownProps.globalId );

	return {
		name: get( post, [ 'author', 'name' ] ),
	};
} )( localize( PostTypePostAuthor ) );
