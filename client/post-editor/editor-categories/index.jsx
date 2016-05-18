/**
 * External dependencies
 */
const React = require( 'react' ),
	without = require( 'lodash/without' ),
	clone = require( 'lodash/clone' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:post-editor:editor-categories' );

/**
 * Internal dependencies
 */
const CategorySelector = require( 'my-sites/category-selector' ),
	AddCategory = require( 'my-sites/category-selector/add-category' ),
	CategoryList = require( 'components/data/category-list-data' ),
	postActions = require( 'lib/posts/actions' ),
	siteUtils = require( 'lib/site/utils' ),
	stats = require( 'lib/posts/stats' );

export default React.createClass( {
	displayName: 'EditorCategories',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object
	},

	getInitialState: function() {
		return {
			searchTerm: null
		};
	},

	getSelectedCategories: function() {
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

	onChange: function( item ) {
		var selected = clone( this.getSelectedCategories() ),
			statName,
			statEvent;

		if ( -1 === selected.indexOf( item.ID ) ) {
			selected.push( item.ID );
		} else {
			selected = without( selected, item.ID );
		}

		if ( selected.length > this.getSelectedCategories().length ) {
			statName = 'category_added';
			statEvent = 'Added Category';
		} else {
			statName = 'category_removed';
			statEvent = 'Removed Category';
		}

		stats.recordStat( statName );
		stats.recordEvent( 'Changed Categories', statEvent );

		// if no category is selected, set the default category
		if ( ! selected.length && this.props.site && this.props.site.options.default_category ) {
			selected.push( this.props.site.options.default_category );
		}

		debug( 'setting selected to', selected );
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		postActions.edit( {
			categories: selected
		} );
	},

	onSearch: function( searchTerm ) {
		this.setState( { searchTerm: searchTerm } );
	},

	render: function() {
		var canAddCategories = siteUtils.userCan( 'manage_categories', this.props.site ),
			categorySelector;

		categorySelector = (
			<CategorySelector
				analyticsPrefix="Editor"
				onChange={ this.onChange }
				className={ classNames( 'editor-categories', { 'no-add-button': ! canAddCategories } ) }
				onSearch={ this.onSearch }
				multiple={ true }
				selected={ this.getSelectedCategories() }
				defaultCategoryId={ siteUtils.getDefaultCategory( this.props.site ) } />
		);

		if ( ! this.props.site ) {
			return categorySelector;
		}

		return (
			<CategoryList siteId={ this.props.site.ID } search={ this.state.searchTerm } >
				{ categorySelector }
				{ canAddCategories && (
					<AddCategory siteId={ this.props.site.ID } searching={ this.state.searchTerm ? true : false } />
				) }
			</CategoryList>
		);
	}
} );
