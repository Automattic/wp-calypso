/**
 * External dependencies
 */
var React = require( 'react' ),
	isEqual = require( 'lodash/isEqual' ),
	debug = require( 'debug' )( 'calypso:menus:categories-options' );

/**
 * Internal dependencies
 */
var MenuPanelBackButton = require( '../menu-panel-back-button' ),
	CategorySelector = require( 'my-sites/term-tree-selector' );

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

	onChange: function( item ) {
		debug( 'setting selected', item );

		this.props.onChange( item );
		this.setState( { selected: [ item ] } );
	},

	render: function() {
		debug( 'rendering', this.props );
		return (
			<CategorySelector
				analyticsPrefix="Menus"
				onChange={ this.onChange }
				className="menu-item-options menu-item-options__term-tree-selector"
				createLink={ this.props.itemType.createLink }
				selected={ this.state.selected }>
					<MenuPanelBackButton label={ this.props.itemType.label } onClick={ this.props.onBackClick } />
			</CategorySelector>
		);
	}
} );
