/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { take, values } from 'lodash';

const TAGS_TO_SHOW = 5;

const ReaderFullPostHeaderTags = ( { tags } ) => {
	let tagsInOccurrenceOrder = values( tags );
	tagsInOccurrenceOrder.sort( ( a, b ) => b.post_count - a.post_count );
	tagsInOccurrenceOrder = take( tagsInOccurrenceOrder, TAGS_TO_SHOW );

	const listItems = tagsInOccurrenceOrder.map( ( tag ) => {
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
