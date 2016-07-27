/**
 * External dependencies
 */
import React from 'react';
import { take, map, values } from 'lodash';

/**
 * Internal dependencies
 */

const ReaderFullPostHeaderTags = ( { tags } ) => {
	const numberOfTagsToDisplay = 5;
	const tagsToDisplay = take( values( tags ), numberOfTagsToDisplay );
	const listItems = map( tagsToDisplay, tag => {
		return ( <li><a href={ `/tag/${tag.slug}` }>{ tag.display_name }</a></li> );
	} );

	return (
		<ul className="reader-full-post-header__tag-list">
			{ listItems }
		</ul>
	);
};

ReaderFullPostHeaderTags.propTypes = {
	tags: React.PropTypes.object.isRequired
};

export default ReaderFullPostHeaderTags;
