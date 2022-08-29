import { values } from 'lodash';
import { Component } from 'react';
import TagLink from 'calypso/blocks/reader-post-card/tag-link';

const TAGS_TO_SHOW = 3;

class TagsList extends Component {
	state = {
		showExtraTags: false,
	};

	showExtraTags = () => {
		this.setState( {
			showExtraTags: ! this.state.showExtraTags,
		} );
	};

	displayExtraTagsButton = ( extraTags ) => {
		const extraTagsButton = (
			<span className="reader-post-card__tag show">
				<button className="reader-post-card__tag-link ignore-click" onClick={ this.showExtraTags }>
					{ extraTags.length }+
				</button>
			</span>
		);
		return ! this.state.showExtraTags && extraTags.length > 0 && extraTagsButton;
	};

	displayExtraTags = ( extraTags ) => {
		return this.state.showExtraTags && extraTags.length > 0 && extraTags;
	};

	render() {
		const tagsInOccurrenceOrder = values( this.props.post.tags );
		tagsInOccurrenceOrder.sort( ( a, b ) => b.post_count - a.post_count );
		const tags = tagsInOccurrenceOrder.map( ( tag ) => <TagLink tag={ tag } key={ tag.slug } /> );
		const defaultTags = tags.slice( 0, TAGS_TO_SHOW );
		const extraTags = tags.slice( TAGS_TO_SHOW );

		return (
			defaultTags.length > 0 && (
				<div className="reader-post-card__tags">
					{ defaultTags }
					{ this.displayExtraTagsButton( extraTags ) }
					{ this.displayExtraTags( extraTags ) }
				</div>
			)
		);
	}
}

export default TagsList;
