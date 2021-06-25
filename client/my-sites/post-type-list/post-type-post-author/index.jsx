/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getPost } from 'calypso/state/posts/selectors';

/**
 * Style dependencies
 */
import './style.scss';

function PostTypePostAuthor( { name } ) {
	if ( ! name ) {
		return null;
	}

	return (
		<div className="post-type-post-author">
			<div className="post-type-post-author__name">{ name }</div>
		</div>
	);
}

PostTypePostAuthor.propTypes = {
	globalId: PropTypes.string,
	name: PropTypes.string,
};

export default connect( ( state, { globalId } ) => {
	const post = getPost( state, globalId );

	return {
		name: get( post, [ 'author', 'name' ] ),
	};
} )( PostTypePostAuthor );
