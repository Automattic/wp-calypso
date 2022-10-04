import { values } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import TagLink from 'calypso/blocks/reader-post-card/tag-link';

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
		const tagsToShow = this.props.tagsToShow || 3;
		const tagsInOccurrenceOrder = values( this.props.post.tags );
		tagsInOccurrenceOrder.sort( ( a, b ) => b.post_count - a.post_count );
		const tags = tagsInOccurrenceOrder.map( ( tag ) => <TagLink tag={ tag } key={ tag.slug } /> );
		const defaultTags = tags.slice( 0, tagsToShow );
		const extraTags = tags.slice( tagsToShow );

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

TagsList.propTypes = {
	post: PropTypes.object.isRequired,
	tagsToShow: PropTypes.number,
};

export default TagsList;
