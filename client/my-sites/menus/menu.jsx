/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:menus:menu' ); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var protectForm = require( 'lib/mixins/protect-form' ),
	observe = require( 'lib/mixins/data-observe' ),
	assign = require( 'lodash/assign' ),
	classNames = require( 'classnames' ),
	MenuName = require( './menu-name' ),
	MenuItemList = require( './menu-item-list' ),
	MenuDeleteButton = require( './menu-delete-button' ),
	MenuSaveButton = require( './menus-save-button' ),
	MenuRevertButton = require( './menus-revert-button' ),
	analytics = require( 'lib/analytics' );

/**
 * Renders one menu
 */
var Menu = React.createClass( {

	mixins: [ protectForm.mixin ],

	MOUSE_DRAG_STEP_PIXELS: 16,

	getInitialState: function() {
		return {
			moveState: {},
			addState: {},
			confirmDeleteItem: null,
			editItemId: null,
			editingTitle: false
		};
	},

	dragDrop: function( action, x, y, item ) {
		if ( 'start' === action ) {
			this.dragStart( x, y, item );
		} else if ( 'over' === action ) {
			this.dragOver( x, y, item );
		} else if ( 'getDraggedItem' === action ) {
			return this.state.draggedItem;
		} else if ( 'end' === action ) {
			this.draggedItem = null;
			if ( this.state.draggedItem ) {
				this.setState( { draggedItem: null } );
				analytics.ga.recordEvent( 'Menus', 'Item drag drop' );
			}
		}
	},

	dragStart: function( x, y, item ) {
		this.draggedItem = item;
		this.draggedItemParent = this.props.siteMenus.getParent( item.id );
		this.dragOrigin = { x: x, y: y };
		this.previousOp = { target: 0, position: '' };
	},

	dragOver: function( x, y, item ) {
		var menuData = this.props.siteMenus,
			moveOp;

		if ( ! this.draggedItem ) {
			return;
		}

		moveOp = this.getMoveOperation( x, y, item );

		if ( moveOp && ! this.operationsEqual( moveOp, this.previousOp ) ) {
			// prevent drop of item into its own subtree
			if ( menuData.isAncestor( this.draggedItem, item ) ) {
				return;
			}

			this.setState( { draggedItem: this.draggedItem } );

			menuData.moveItem( this.draggedItem.id, moveOp.target, moveOp.position );
			this.previousOp = moveOp;
			this.dragOrigin = { x: x, y: y };
			this.draggedItemParent = menuData.getParent( this.draggedItem.id );
		}
	},

	getMoveOperation: function( x, y, item ) {
		var menuData = this.props.siteMenus,
			parent = menuData.getParent( item.id ),
			previousSibling;

		if ( this.draggedItem !== item ) {
			return { target: item.id, position: this.mouseMovedDown( y ) ? 'after' : 'before' };
		} else if ( this.mouseMovedRight( x ) ) {
			previousSibling = menuData.getPreviousSibling( this.draggedItem, parent );
			if ( previousSibling ) {
				return { target: previousSibling.id, position: 'child' };
			}
		} else if ( this.mouseMovedLeft( x ) && this.draggedItemParent ) {
			if ( menuData.hasSubsequentSiblings( this.draggedItem, this.draggedItemParent ) ) {
				// this would require re-parenting the siblings, so disallow
				return;
			}
			return { target: this.draggedItemParent.id, position: 'after' };
		}
	},

	mouseMovedDown: function( y ) {
		return y - this.dragOrigin.y > 0;
	},

	mouseMovedLeft: function( x ) {
		return this.dragOrigin.x - this.MOUSE_DRAG_STEP_PIXELS > x;
	},

	mouseMovedRight: function( x ) {
		return x - this.dragOrigin.x > this.MOUSE_DRAG_STEP_PIXELS;
	},

	operationsEqual: function( op1, op2 ) {
		return op1.target === op2.target && op1.position === op2.position;
	},

	setMenuName: function( name ) {
		if ( name && name !== this.props.selectedMenu.name ) {
			analytics.ga.recordEvent( 'Menus', 'Updated Menu Title' );
		}
		this.props.siteMenus.setMenuName( this.props.selectedMenu.id, name );
	},

	/**
	 * @param {string} action: 'add' | 'position' | 'cancel' | 'first'
	 * @param {int} id: depending on action, either of:
	 *                     - ID of item around which to create a new item
	 *                     - position index ('before', 'after', or 'child')
	 */
	doAddItem: function( action, id ) {
		var oldState = this.state.addState,
			newState = {};

		if ( 'add' === action ) {
			newState.targetId = id;
		} else if ( 'position' === action ) {
			assign( newState, oldState );
			newState.position = id;
			newState.menu = this.props.selectedMenu.id;
		}

		this.setState( { addState: newState } );
	},

	/**
	 * Called for each stage of an item move.
	 *
	 * Sequence to perform a move:
	 *    setSource -> setTarget -> position
	 *
	 * @param {string} action: 'setSource' | 'setTarget' | 'position' | 'cancel'
	 * @param {*} data: multipurpose, depending on action:
	 *                     action 'setSource': {int} source item ID
	 *                     action 'setTarget': {int} target item ID
	 *                     action 'position': {string} target position index ('before' | 'after' | 'child')
	 *
	 */
	doMoveItem: function( action, data ) {
		var oldState = this.state.moveState,
			newState = {};

		if ( 'setSource' === action ) {
			newState.moving = true;
			newState.sourceId = data;
		} else if ( 'setTarget' === action ) {
			assign( newState, oldState );
			newState.targetId = data;
		} else if ( 'position' === action ) {
			this.props.siteMenus.moveItem(
				oldState.sourceId,
				oldState.targetId,
				data
			);
		}

		this.setState( { moveState: newState } );
	},

	/**
	 * Set id of item that is asking for delete confirmation
	 * from user.
	 * @param {*} id: item id or null for no item
	 */
	setConfirmDeleteItem: function( id ) {
		this.setState( { confirmDeleteItem: id } );
	},

	setEditItem: function( itemId ) {
		this.setState( { editItemId: itemId } );
	},

	getEditItem: function() {
		return this.state.editItemId;
	},

	renderAddTip: function() {
		return ! this.getEditItem()
			? <div className="menus__add-item-footer-label">
				{ this.translate( 'Add new item' ) }
			</div>
			: null;
	},

	updateTitleEditing: function( editing ) {
		this.setState( { editingTitle: editing } );
	},

	render: function() {
		var menuName, menuItemList;

		if ( this.props.selectedMenu ) {
			menuName = (
				<h2 className="menus__menu-name">
					<MenuName
						className="is-editable"
						value={ this.props.selectedMenu.name }
						onTitleEdit={ this.updateTitleEditing }
						onChange={ this.setMenuName } />
				</h2>
			);

			menuItemList = (
				<MenuItemList items={ this.props.selectedMenu.items }
						setEditItem={ this.setEditItem }
						getEditItem={ this.getEditItem }
						moveState={ this.state.moveState }
						doMoveItem={ this.doMoveItem }
						addState={ this.state.addState }
						doAddItem={ this.doAddItem }
						confirmDeleteItem={ this.state.confirmDeleteItem }
						setConfirmDeleteItem={ this.setConfirmDeleteItem }
						dragDrop={ this.dragDrop } />
			);
		}

		const classes = classNames( {
			'menus__menu-header': true,
			'is-editing-title': this.state.editingTitle
		} );

		return (
			<div>
				<div className={ classes }>
					{ menuName }
					<div className="menus__menu-actions">
						<MenuDeleteButton selectedMenu={ this.props.selectedMenu }
								selectedLocation={ this.props.selectedLocation }
								setBusy={ this.props.setBusy }
								confirmDiscard={ this.props.confirmDiscard } />
						<MenuRevertButton menuData={ this.props.siteMenus } />
						<MenuSaveButton menuData={ this.props.siteMenus }
								selectedMenu={ this.props.selectedMenu } />
					</div>
				</div>

				{ menuItemList }
				{ this.renderAddTip() }
			</div>
		);
	}
} );

module.exports = Menu;
