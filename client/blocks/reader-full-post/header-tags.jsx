import { values } from 'lodash';
import PropTypes from 'prop-types';
import TagLink from 'calypso/blocks/reader-post-card/tag-link';

const TAGS_TO_SHOW = 5;

const ReaderFullPostHeaderTags = ( { tags } ) => {
	let tagsInOccurrenceOrder = values( tags );
	tagsInOccurrenceOrder.sort( ( a, b ) => b.post_count - a.post_count );
	tagsInOccurrenceOrder = tagsInOccurrenceOrder.slice( 0, TAGS_TO_SHOW );

	const tagLinks = tagsInOccurrenceOrder.map( ( tag ) => <TagLink tag={ tag } key={ tag.slug } /> );
	const defaultTags = tagLinks.slice( 0, TAGS_TO_SHOW );
	const extraTags = tagLinks.slice( TAGS_TO_SHOW );

	return (
		defaultTags.length > 0 && (
			<div className="reader-post-card__tags">
				{ defaultTags }
				{ this.displayExtraTagsButton( extraTags ) }
				{ this.displayExtraTags( extraTags ) }
			</div>
		)
	);

	// const listItems = tagsInOccurrenceOrder.map( ( tag ) => {
	// 	return (
	// 		<li key={ `post-tag-${ tag.slug }` } className="reader-full-post__header-tag-list-item">
	// 			<a href={ `/tag/${ tag.slug }` } className="reader-full-post__header-tag-list-item-link">
	// 				{ tag.name }
	// 			</a>
	// 		</li>
	// 	);
	// } );
	//
	// return <ul className="reader-full-post__header-tag-list">{ listItems }</ul>;
};

ReaderFullPostHeaderTags.propTypes = {
	tags: PropTypes.object.isRequired,
};

export default ReaderFullPostHeaderTags;
