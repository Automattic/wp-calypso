/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	isEqual = require( 'lodash/lang/isEqual' ),
	debug = require( 'debug' )( 'calypso:menus:categories-options' );

/**
 * Internal dependencies
 */
var MenuPanelBackButton = require( '../menu-panel-back-button' ),
	CategorySelector = require( 'my-sites/category-selector' ),
	CategoryList = require( 'components/data/category-list-data' );

// The `selected` prop item passed in from MenuEditableItem
// Isn't a Category object, a quick transform to get the correct ID in place
function categoryObjectFromItem( menuItem ) {
	var selectedCategory = {};
	if ( menuItem && menuItem.content_id ) {
		selectedCategory = { ID: menuItem.content_id };
	}

	return selectedCategory;
}

module.exports = React.createClass( {
	displayName: 'MenusCategoriesOptions',

	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		selected: React.PropTypes.object,
		itemType: React.PropTypes.object,
		onBackClick: React.PropTypes.func.isRequired,
		onChange: React.PropTypes.func.isRequired
	},

	getInitialState: function() {
		var selected = [];

		if ( this.props.selected ) {
			selected.push( categoryObjectFromItem( this.props.selected ) );
		}

		return {
			searchTerm: null,
			selected: selected
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		var nextSelection = categoryObjectFromItem( nextProps.selected ),
			currentSelection = categoryObjectFromItem( this.props.selected );

		if ( ! isEqual( nextSelection, currentSelection ) ) {
			this.setState( { selected: [ nextSelection ] } );
		}
	},

	onSearch: function( searchTerm ) {
		debug( 'setting search term', searchTerm );
		this.setState( { searchTerm: searchTerm } );
	},

	onChange: function( item ) {
		debug( 'setting selected', item );

		this.props.onChange( item );
		this.setState( { selected: [ item ] } );
	},

	render: function() {
		debug( 'rendering', this.props );
		return (
			<CategoryList siteId={ this.props.siteId } search={ this.state.searchTerm } >
				<CategorySelector
					analyticsPrefix="Menus"
					onChange={ this.onChange }
					className="menu-item-options"
					onSearch={ this.onSearch }
					createLink={ this.props.itemType.createLink }
					selected={ this.state.selected }>
						<MenuPanelBackButton label={ this.props.itemType.label } onClick={ this.props.onBackClick } />
				</CategorySelector>
			</CategoryList>
		);
	}
} );
