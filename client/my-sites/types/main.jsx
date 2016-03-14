/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import PostTypeList from 'my-sites/post-type-list';

export default function Types( { type } ) {
	return (
		<Main>
			<PostTypeList type={ type } />
		</Main>
	);
}

Types.propTypes = {
	type: PropTypes.string.isRequired
};
