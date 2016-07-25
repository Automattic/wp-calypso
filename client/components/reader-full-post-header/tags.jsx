/**
 * External dependencies
 */
import React from 'react';
import { take } from 'lodash';

/**
 * Internal dependencies
 */

const ReaderFullPostHeaderTags = ( { tags } ) => {
	const numberOfTagsToDisplay = 5;
	const tagsToDisplay = take( tags, numberOfTagsToDisplay );

	return (
		<ul className="reader-full-post-header__tags">
			<li>tag 1</li>
			<li>tag 2</li>
			<li>tag 3</li>
			<li>tag 4</li>
			<li>tag 5</li>
		</ul>
	);
};

ReaderFullPostHeaderTags.propTypes = {
	tags: React.PropTypes.object.isRequired
};

export default ReaderFullPostHeaderTags;
