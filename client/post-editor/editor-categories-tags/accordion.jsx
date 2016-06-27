/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import Gridicon from 'components/gridicon';
import Categories from 'post-editor/editor-categories';
import Tags from 'post-editor/editor-tags';
import TermStore from 'lib/terms/store';
import siteUtils from 'lib/site/utils';
import InfoPopover from 'components/info-popover';
import { isPage } from 'lib/posts/utils';
import unescapeString from 'lodash/unescape';

module.exports = React.createClass( {
	displayName: 'EditorCategoriesTagsAccordion',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
		// passed down from CategoryListData
		categories: React.PropTypes.array,
		categoriesFound: React.PropTypes.number,
		categoriesHasNextPage: React.PropTypes.bool,
		categoriesFetchingNextPage: React.PropTypes.bool,
		// passed down from TagListData
		tags: React.PropTypes.array,
		tagsHasNextPage: React.PropTypes.bool,
		tagsFetchingNextPage: React.PropTypes.bool
	},

	isCategoriesLoading: function() {
		if ( ! this.props.site ) {
			return true;
		}

		return this.props.categoriesFetchingNextPage;
	},

	getCategories: function() {
		var defaultCategory;

		if ( ! this.props.post ) {
			return [];
		}

		if ( this.props.post.category_ids ) {
			return this.props.post.category_ids;
		}

		defaultCategory = siteUtils.getDefaultCategory( this.props.site );
		if ( defaultCategory ) {
			return [ defaultCategory ];
		}

		return [];
	},

	renderCategories: function() {
		if ( isPage( this.props.post ) ) {
			return;
		}

		return (
			<AccordionSection>
				<label className="editor-drawer__label">
					<span className="editor-drawer__label-text">
						{ this.translate( 'Categories' ) }
						<InfoPopover position="top left">
							{ this.translate( 'Use categories to group your posts by topic.' ) }
						</InfoPopover>
					</span>
				</label>
				<Categories site={ this.props.site } post={ this.props.post } />
			</AccordionSection>
		);
	},

	renderTags: function() {
		return (
			<AccordionSection>
				<Tags
					post={ this.props.post }
					tags={ this.props.tags }
					tagsHasNextPage={ this.props.tagsHasNextPage }
					tagsFetchingNextPage={ this.props.tagsFetchingNextPage }
				/>
			</AccordionSection>
		);
	},

	getCategoriesSubtitle() {
		const siteId = this.props.site.ID;

		// There's also post.categories but it doesn't have category names
		// either, so we need to get them from the site categories data
		const categories = this.getCategories().map( ( categoryId ) => {
			const category = TermStore.get( siteId, categoryId );
			return category ? unescapeString( category.name ) : null;
		} ).filter( categoryName => categoryName );

		switch ( categories.length ) {
			case 0:
				return null; // No categories subtitle
			case 1:
				return categories[0];
			default:
				// Special-casing the singular is good, but we still need the
				// singular+plural version for the default branch because some
				// languages use the singular for numbers ending in 1, sort of
				// like how we’d say "21st", "31st", etc.
				return this.translate(
					'%d category',
					'%d categories',
					{ args: [ categories.length ], count: categories.length }
				);
		}
	},

	getTagsSubtitle() {
		let tags = this.props.post.tags || [];
		tags = Array.isArray( tags ) ? tags : Object.keys( tags );
		tags = tags.map( unescapeString );

		switch ( tags.length ) {
			case 0:
				return null; // No tags subtitle
			case 1:
				return '#' + tags[0];
			case 2:
				return '#' + tags[0] + ', #' + tags[1];
			default:
				return this.translate(
					'%d tag',
					'%d tags',
					{ args: [ tags.length ], count: tags.length }
				);
		}
	},

	getSubtitle: function() {
		const subtitlePieces = [];

		if ( ! this.props.site || ! this.props.post ) {
			return null;
		}

		if ( ! isPage( this.props.post ) ) {
			const categoriesSubtitle = this.getCategoriesSubtitle();
			if ( categoriesSubtitle ) {
				subtitlePieces.push( categoriesSubtitle );
			}
		}

		const tagsSubtitle = this.getTagsSubtitle();
		if ( tagsSubtitle ) {
			subtitlePieces.push( tagsSubtitle );
		}

		if ( ! isPage( this.props.post ) && this.isCategoriesLoading() ) {
			return this.translate( 'Loading…' );
		}

		return subtitlePieces.join( ', ' );
	},

	getTitle: function() {
		let title;
		if ( isPage( this.props.post ) ) {
			title = this.translate( 'Tags' );
		} else {
			title = this.translate( 'Categories & Tags' );
		}
		return title;
	},

	render: function() {
		var classes = classNames( 'editor-drawer__accordion', 'editor-categories-tags__accordion', this.props.className, {
			'is-loading': ! this.props.site || ! this.props.post || this.isCategoriesLoading()
		} );

		return (
			<Accordion
				title={ this.getTitle() }
				subtitle={ this.getSubtitle() }
				icon={ <Gridicon icon="tag" /> }
				className={ classes }
			>
				{ this.renderCategories() }
				{ this.renderTags() }
			</Accordion>
		);
	}
} );
