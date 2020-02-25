/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { Button, QueryControls as BaseControl, ToggleControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * External dependencies.
 */

/**
 * Internal dependencies.
 */
import AutocompleteTokenField from './autocomplete-tokenfield';

class QueryControls extends Component {
	state = {
		showAdvancedFilters: false,
	};

	fetchPostSuggestions = search => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/search', {
				search,
				per_page: 20,
				_fields: 'id,title',
				type: 'post',
			} ),
		} ).then( function( posts ) {
			const result = posts.map( post => ( {
				value: post.id,
				label: decodeEntities( post.title ) || __( '(no title)', 'newspack-blocks' ),
			} ) );
			return result;
		} );
	};
	fetchSavedPosts = postIDs => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/posts', {
				per_page: 100,
				include: postIDs.join( ',' ),
				_fields: 'id,title',
			} ),
		} ).then( function( posts ) {
			return posts.map( post => ( {
				value: post.id,
				label: decodeEntities( post.title.rendered ) || __( '(no title)', 'newspack-blocks' ),
			} ) );
		} );
	};

	fetchAuthorSuggestions = search => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/users', {
				search,
				per_page: 20,
				_fields: 'id,name',
			} ),
		} ).then( function( users ) {
			return users.map( user => ( {
				value: user.id,
				label: decodeEntities( user.name ) || __( '(no name)', 'newspack-blocks' ),
			} ) );
		} );
	};
	fetchSavedAuthors = userIDs => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/users', {
				per_page: 100,
				include: userIDs.join( ',' ),
				_fields: 'id,name',
			} ),
		} ).then( function( users ) {
			return users.map( user => ( {
				value: user.id,
				label: decodeEntities( user.name ) || __( '(no name)', 'newspack-blocks' ),
			} ) );
		} );
	};

	fetchCategorySuggestions = search => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/categories', {
				search,
				per_page: 20,
				_fields: 'id,name',
				orderby: 'count',
				order: 'desc',
			} ),
		} ).then( function( categories ) {
			return categories.map( category => ( {
				value: category.id,
				label: decodeEntities( category.name ) || __( '(no title)', 'newspack-blocks' ),
			} ) );
		} );
	};
	fetchSavedCategories = categoryIDs => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/categories', {
				per_page: 100,
				_fields: 'id,name',
				include: categoryIDs.join( ',' ),
			} ),
		} ).then( function( categories ) {
			return categories.map( category => ( {
				value: category.id,
				label: decodeEntities( category.name ) || __( '(no title)', 'newspack-blocks' ),
			} ) );
		} );
	};

	fetchTagSuggestions = search => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/tags', {
				search,
				per_page: 20,
				_fields: 'id,name',
				orderby: 'count',
				order: 'desc',
			} ),
		} ).then( function( tags ) {
			return tags.map( tag => ( {
				value: tag.id,
				label: decodeEntities( tag.name ) || __( '(no title)', 'newspack-blocks' ),
			} ) );
		} );
	};
	fetchSavedTags = tagIDs => {
		return apiFetch( {
			path: addQueryArgs( '/wp/v2/tags', {
				per_page: 100,
				_fields: 'id,name',
				include: tagIDs.join( ',' ),
			} ),
		} ).then( function( tags ) {
			return tags.map( tag => ( {
				value: tag.id,
				label: decodeEntities( tag.name ) || __( '(no title)', 'newspack-blocks' ),
			} ) );
		} );
	};

	render = () => {
		const {
			specificMode,
			onSpecificModeChange,
			specificPosts,
			onSpecificPostsChange,
			authors,
			onAuthorsChange,
			categories,
			onCategoriesChange,
			tags,
			onTagsChange,
			tagExclusions,
			onTagExclusionsChange,
			enableSpecific,
		} = this.props;
		const { showAdvancedFilters } = this.state;

		return [
			enableSpecific && (
				<ToggleControl
					key="specificMode"
					checked={ specificMode }
					onChange={ onSpecificModeChange }
					label={ __( 'Choose Specific Posts', 'newspack-blocks' ) }
				/>
			),
			specificMode && (
				<AutocompleteTokenField
					key="posts"
					tokens={ specificPosts || [] }
					onChange={ onSpecificPostsChange }
					fetchSuggestions={ this.fetchPostSuggestions }
					fetchSavedInfo={ this.fetchSavedPosts }
					label={ __( 'Posts', 'newspack-blocks' ) }
					help={ __(
						'Begin typing post title, click autocomplete result to select.',
						'newspack-blocks'
					) }
				/>
			),
			! specificMode && <BaseControl key="queryControls" { ...this.props } />,
			! specificMode && onAuthorsChange && (
				<AutocompleteTokenField
					key="authors"
					tokens={ authors || [] }
					onChange={ onAuthorsChange }
					fetchSuggestions={ this.fetchAuthorSuggestions }
					fetchSavedInfo={ this.fetchSavedAuthors }
					label={ __( 'Authors', 'newspack-blocks' ) }
				/>
			),
			! specificMode && onCategoriesChange && (
				<AutocompleteTokenField
					key="categories"
					tokens={ categories || [] }
					onChange={ onCategoriesChange }
					fetchSuggestions={ this.fetchCategorySuggestions }
					fetchSavedInfo={ this.fetchSavedCategories }
					label={ __( 'Categories', 'newspack-blocks' ) }
				/>
			),
			! specificMode && onTagsChange && (
				<AutocompleteTokenField
					key="tags"
					tokens={ tags || [] }
					onChange={ onTagsChange }
					fetchSuggestions={ this.fetchTagSuggestions }
					fetchSavedInfo={ this.fetchSavedTags }
					label={ __( 'Tags', 'newspack-blocks' ) }
				/>
			),
			! specificMode && onTagExclusionsChange && (
				<p key="toggle-advanced-filters">
					<Button
						isLink
						onClick={ () => this.setState( { showAdvancedFilters: ! showAdvancedFilters } ) }
					>
						{ showAdvancedFilters
							? __( 'Hide Advanced Filters', 'newspack-blocks' )
							: __( 'Show Advanced Filters', 'newspack-blocks' ) }
					</Button>
				</p>
			),
			! specificMode && onTagExclusionsChange && showAdvancedFilters && (
				<AutocompleteTokenField
					key="tag-exclusion"
					tokens={ tagExclusions || [] }
					onChange={ onTagExclusionsChange }
					fetchSuggestions={ this.fetchTagSuggestions }
					fetchSavedInfo={ this.fetchSavedTags }
					label={ __( 'Excluded Tags', 'newspack-blocks' ) }
				/>
			),
		];
	};
}

QueryControls.defaultProps = {
	enableSpecific: true,
	specificPosts: [],
	authors: [],
	categories: [],
	tags: [],
	tagExclusions: [],
};

export default QueryControls;
