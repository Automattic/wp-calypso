/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { take, map, values } from 'lodash';

const ReaderFullPostHeaderTags = ( { tags } ) => {
	const numberOfTagsToDisplay = 5;
	const tagsToDisplay = take( values( tags ), numberOfTagsToDisplay );
	const listItems = map( tagsToDisplay, ( tag ) => {
		return (
			<li key={ `post-tag-${ tag.slug }` } className="reader-full-post__header-tag-list-item">
				<a href={ `/tag/${ tag.slug }` } className="reader-full-post__header-tag-list-item-link">
					{ tag.name }
				</a>
			</li>
		);
	} );

	return <ul className="reader-full-post__header-tag-list">{ listItems }</ul>;
};

ReaderFullPostHeaderTags.propTypes = {
	tags: PropTypes.object.isRequired,
};

export default ReaderFullPostHeaderTags;
