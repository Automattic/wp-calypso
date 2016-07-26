/**
 * External dependencies
 */
import React from 'react';
import { take } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */

const ReaderFullPostHeaderTags = ( { tags } ) => {
	const numberOfTagsToDisplay = 5;
	const tagsToDisplay = take( tags, numberOfTagsToDisplay );

	return (
		<div className="reader-full-post-header__tags">
			<Gridicon icon="tag" size={ 18 } />
			<ul className="reader-full-post-header__tag-list">
				<li><a href="">Tag 1</a></li>
				<li><a href="">Tag 2</a></li>
				<li><a href="">Tag 3</a></li>
				<li><a href="">Tag 4</a></li>
				<li><a href="">Tag 5</a></li>
			</ul>
		</div>
	);
};

ReaderFullPostHeaderTags.propTypes = {
	tags: React.PropTypes.object.isRequired
};

export default ReaderFullPostHeaderTags;
