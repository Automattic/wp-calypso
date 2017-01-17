/**
 * External dependencies
 */
var React = require( 'react' ),
	isEqual = require( 'lodash/isEqual' ),
	debug = require( 'debug' )( 'calypso:menus:taxonomy-options' );

/**
 * Internal dependencies
 */
import MenuPanelBackButton from '../menu-panel-back-button';
import TermTreeSelector from 'blocks/term-tree-selector';

// The `selected` prop item passed in from MenuEditableItem
// Isn't a Term object, a quick transform to get the correct ID in place
function termObjectFromItem( menuItem ) {
	let selectedTerm = {};
	if ( menuItem && menuItem.content_id ) {
		selectedTerm = { ID: menuItem.content_id };
	}

	return selectedTerm;
}

module.exports = React.createClass( {
	displayName: 'MenusTaxonomyOptions',

	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		selected: React.PropTypes.object,
		taxonomy: React.PropTypes.string,
		itemType: React.PropTypes.object,
		onBackClick: React.PropTypes.func.isRequired,
		onChange: React.PropTypes.func.isRequired
	},

	getInitialState: function() {
		var selected = [];

		if ( this.props.selected ) {
			selected.push( termObjectFromItem( this.props.selected ) );
		}

		return {
			selected: selected
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		const nextSelection = termObjectFromItem( nextProps.selected ),
			currentSelection = termObjectFromItem( this.props.selected );

		if ( ! isEqual( nextSelection, currentSelection ) ) {
			this.setState( { selected: [ nextSelection ] } );
		}
	},

	onChange: function( item ) {
		debug( 'setting selected', item );

		this.props.onChange( item );
		this.setState( { selected: [ item ] } );
	},

	getSelectedIds() {
		return this.state.selected.map( function( item ) {
			if ( ! item.ID ) {
				return item;
			}

			return item.ID;
		} );
	},

	render: function() {
		debug( 'rendering', this.props );
		return (
			<div className="menu-item-options menu-item-options__term-tree-selector">
				<MenuPanelBackButton
					name={ this.props.itemType.name }
					label={ this.props.itemType.label }
					onClick={ this.props.onBackClick }
				/>
				<TermTreeSelector
					analyticsPrefix="Menus"
					taxonomy={ this.props.itemType.name }
					onChange={ this.onChange }
					createLink={ this.props.itemType.createLink }
					selected={ this.getSelectedIds() }
					height={ 260 }>
				</TermTreeSelector>
			</div>
		);
	}
} );
