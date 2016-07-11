/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CategoryListData from 'components/data/category-list-data';
import CategoriesTagsAccordion from 'post-editor/editor-categories-tags/accordion';
import TagListData from 'components/data/tag-list-data';

const EditorDrawerCategoriesAndTags = React.createClass( {

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object
	},

	render() {
		if ( ! this.props.site ) {
			return;
		}

		return (
			<CategoryListData siteId={ this.props.site.ID }>
				<TagListData siteId={ this.props.site.ID }>
					<CategoriesTagsAccordion
						site={ this.props.site }
						post={ this.props.post } />
				</TagListData>
			</CategoryListData>
		);
	}
} );

export default EditorDrawerCategoriesAndTags;
