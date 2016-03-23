/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import PostTypeFilter from 'my-sites/post-type-filter';
import PostTypeList from 'my-sites/post-type-list';

export default function Types( { query } ) {
	return (
		<Main>
			<PostTypeFilter />
			<PostTypeList query={ query } />
		</Main>
	);
}

Types.propTypes = {
	query: PropTypes.object
};
