/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { QueryControls as BaseControl, SelectControl, ToggleControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * Internal dependencies.
 */
import AutocompleteTokenField from './autocomplete-tokenfield';

class QueryControls extends Component {

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
			numberOfItems,
			onNumberOfItemsChange,
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
			enableSpecific,
		} = this.props;

		return [
			enableSpecific && (
				<ToggleControl
					checked={ specificMode }
					onChange={ onSpecificModeChange }
					label={ __( 'Choose specific stories', 'newspack-blocks' ) }
				/>
			),
			specificMode && (
				<AutocompleteTokenField
					tokens={ specificPosts || [] }
					onChange={ onSpecificPostsChange }
					fetchSuggestions={ this.fetchPostSuggestions }
					fetchSavedInfo={ this.fetchSavedPosts }
					label={ __( 'Posts', 'newspack-blocks' ) }
				/>
			),
			! specificMode && <BaseControl { ...this.props } />,
			! specificMode && onAuthorsChange && (
				<AutocompleteTokenField
					tokens={ authors || [] }
					onChange={ onAuthorsChange }
					fetchSuggestions={ this.fetchAuthorSuggestions }
					fetchSavedInfo={ this.fetchSavedAuthors }
					label={ __( 'Authors', 'newspack-blocks' ) }
				/>
			),
			! specificMode && onCategoriesChange && (
				<AutocompleteTokenField
					tokens={ categories || [] }
					onChange={ onCategoriesChange }
					fetchSuggestions={ this.fetchCategorySuggestions }
					fetchSavedInfo={ this.fetchSavedCategories }
					label={ __( 'Categories', 'newspack-blocks' ) }
					/>
			),
			! specificMode && onTagsChange && (
				<AutocompleteTokenField
					tokens={ tags || [] }
					onChange={ onTagsChange }
					fetchSuggestions={ this.fetchTagSuggestions }
					fetchSavedInfo={ this.fetchSavedTags }
					label={ __( 'Tags', 'newspack-blocks' ) }
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
};

export default QueryControls;
