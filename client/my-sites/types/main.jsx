/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Page from 'components/data/page';
import PostTypeFilter from 'my-sites/post-type-filter';
import PostTypeList from 'my-sites/post-type-list';

export default function Types( { query } ) {
	// [TODO]: Translate title text when settled upon
	return (
		<Main>
			<Page title="Custom Post Type" />
			<PostTypeFilter />
			<PostTypeList query={ query } />
		</Main>
	);
}

Types.propTypes = {
	query: PropTypes.object
};
