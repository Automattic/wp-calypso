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
				<li><a href="">tag 1</a></li>
				<li><a href="">tag 2</a></li>
				<li><a href="">tag 3</a></li>
				<li><a href="">tag 4</a></li>
				<li><a href="">tag 5</a></li>
			</ul>
		</div>
	);
};

ReaderFullPostHeaderTags.propTypes = {
	tags: React.PropTypes.object.isRequired
};

export default ReaderFullPostHeaderTags;
