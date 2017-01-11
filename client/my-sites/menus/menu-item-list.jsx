/**
 * External dependencies
 */
var React = require( 'react' ),
	ReactCSSTransitionGroup = require( 'react-addons-css-transition-group' ),
	debug = require( 'debug' )( 'calypso:menus:menu-items-list' ); // eslint-disable-line no-unused-vars
import { connect } from 'react-redux';
import { get, find } from 'lodash';

/**
 * Internal dependencies
 */
var MenuEditableItem = require( './menu-editable-item' ),
	siteMenus = require( 'lib/menu-data' ),
	MenuItemDropTarget = require( './menu-item-drop-target' ),
	analytics = require( 'lib/analytics' );
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRequestingPostTypes } from 'state/post-types/selectors';
import { getMenuItemTypes } from 'state/selectors';

/**
 * Components
 */
var MenuItemList = React.createClass( {

	getDefaultProps: function() {
		return {
			depth: 0
		};
	},

	renderEmptyMenu: function() {
		// Only render once, at the root of the menu
		if ( 0 === this.props.depth ) {
			return <EmptyMenu doAddItem={ this.props.doAddItem }
						depth={ this.props.depth + 1 }
						addState={ this.props.addState } />;
		}
		return null;
	},

	render: function() {

		if ( 0 === this.props.items.length ) {
			return this.renderEmptyMenu();
		}

		return (
			<ul className="menus__items">
				{ this.props.items.map( function( menuItem ) {
						return <MenuItem
							key={ menuItem.id }
							item={ menuItem }
							itemTypes={ this.props.itemTypes }
							items={ menuItem.items }
							depth={ this.props.depth + 1 }
							getEditItem={ this.props.getEditItem }
							setEditItem={ this.props.setEditItem }
							moveState={ this.props.moveState }
							doMoveItem={ this.props.doMoveItem }
							addState={ this.props.addState }
							doAddItem={ this.props.doAddItem }
							confirmDeleteItem={ this.props.confirmDeleteItem }
							setConfirmDeleteItem={ this.props.setConfirmDeleteItem }
							dragDrop={ this.props.dragDrop } />;
				}, this ) }
			</ul>
		);
	}
} );

var MenuItem = React.createClass( {

	onDragStart: function( e ) {
		e.dataTransfer.effectAllowed = 'move';
		// setData() is necessary for starting the drag in firefox
		e.dataTransfer.setData( 'text', 'dummy' );

		this.props.dragDrop( 'start', e.clientX, e.clientY, this.props.item );

		// dragend events will not fire if dragged element has
		// been removed from DOM, so end drag on mousemove
		window.addEventListener( 'mousemove', this.onDragEnd );
	},

	onDragOver: function( e ) {
		// onDragOver default is to reset drag op
		e.preventDefault();

		this.props.dragDrop( 'over', e.clientX, e.clientY, this.props.item );
	},

	onDragEnd: function( e ){
		// stop Firefox dropping text into address bar
		e.preventDefault();

		window.removeEventListener( 'mousemove', this.onDragEnd );
		this.props.dragDrop( 'end' );
	},

	getDefaultProps: function() {
		return {
			items: Object.freeze( [] ),
			depth: 0
		};
	},

	edit: function() {
		this.props.setEditItem( this.props.item.id );
	},

	cancelCurrentOperation: function() {
		this.props.setEditItem( null );
		this.props.doMoveItem( 'cancel' );
		this.props.doAddItem( 'cancel' );
	},

	startMoveItem: function() {
		this.props.setEditItem( null );
		this.props.doMoveItem( 'setSource', this.props.item.id );
	},

	selectMoveItem: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Move Here Link' );
		this.props.doMoveItem( 'setTarget', this.props.item.id );
	},

	cancelDelete: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Back / Cancel Trash Item Button' );
		this.props.setConfirmDeleteItem( null );
		this.edit();
	},

	confirmDelete: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Delete Item Confirmation Button' );
		this.props.setConfirmDeleteItem( null );
		siteMenus.deleteMenuItem( this.props.item );
	},

	markForDeletion: function() {
		this.props.setConfirmDeleteItem( this.props.item.id );
	},

	isEditing: function() {
		return this.props.getEditItem() === this.props.item.id;
	},

	addNewItemInProgress: function() {
		return !! this.props.addState.targetId;
	},

	canEdit: function() {
		return ! this.props.getEditItem() &&
			! this.props.moveState.moving &&
			! this.addNewItemInProgress() &&
			! this.props.confirmDeleteItem;
	},

	/**
	 * @returns {boolean} true if this item has been chosen as the initial
	 *    target for a new item
	 */
	isAddItemTarget: function() {
		return this.props.addState.targetId === this.props.item.id &&
			! this.props.addState.position;
	},

	/**
	 * @returns {boolean} true if supplied position relative to this item
	 *    has been chosen as the final target for a new menu item
	 */
	isAddItemPosition: function( position ) {
		return this.props.addState.targetId === this.props.item.id &&
			position === this.props.addState.position;
	},

	isMoveItemTarget: function() {
		return this.props.moveState.targetId === this.props.item.id;
	},

	isMoveItemSource: function() {
		return this.props.moveState.sourceId === this.props.item.id;
	},

	isBeingDragged: function() {
		var draggedItem = this.props.dragDrop( 'getDraggedItem' );
		return draggedItem &&
			( draggedItem.id === this.props.item.id ||
				siteMenus.isAncestor( draggedItem, this.props.item ) );
	},

	isCorrupt: function() {
		return this.props.item.type === '' ||
			this.props.item.type_family === '';
	},

	renderLabel: function() {
		const itemType = find( this.props.itemTypes, { name: this.props.item.type } )
		const icon = get( itemType, 'icon', 'standard' );
		return (
			<span className={ `menu-item-name noticon noticon-${ icon }` }>
				{ this.props.item.name }
			</span>
		);
	},

	renderDropButton: function() {
		if ( this.props.moveState.moving && this.props.moveState.sourceId !== this.props.item.id ) {
			return (
				<span
					onClick={ this.selectMoveItem }
					className="menu-item-action move">{ this.translate( 'Move here' ) }
				</span>
			);
		}
	},

	onClickCancelButton: function() {
		if ( this.isMoveItemSource() ) {
			analytics.ga.recordEvent( 'Menus', 'Clicked Cancel Move Item Button' );
		} else if ( this.isAddItemTarget() ) {
			analytics.ga.recordEvent( 'Menus', 'Clicked Cancel Add Item Button' );
		}
		this.cancelCurrentOperation();
	},

	renderCancelButton: function() {
		if ( this.isMoveItemSource() || this.isAddItemTarget() ) {
			return (
				<button onClick={ this.onClickCancelButton } className="button">{ this.translate( 'Cancel' ) }</button>
			);
		}
	},

	onEditButtonClick: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Edit Item Icon' );
		this.edit();
	},

	renderEditButton: function() {
		if ( this.canEdit() ) {
			return (
				<span
					onClick={ this.onEditButtonClick }
					className="menu-item-action edit">{ this.translate( 'Edit' ) }
				</span>
			);
		}
	},

	onAddButtonClick: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Add New Menu Item Icon' );
		this.props.doAddItem( 'add', this.props.item.id );
	},

	renderAddButton: function() {
		if ( this.canEdit() ) {
			return (
				<span
					onClick={ this.onAddButtonClick }
					className="menu-item-action add">{ this.translate( 'Add' ) }
				</span>
			);
		}
	},

	renderItem: function() {
		if ( this.props.confirmDeleteItem === this.props.item.id ) {
			return this.renderDeletedItem();
		}

		var className = [
			'menus__menu-item',
			'depth-' + this.props.depth,
			this.isCorrupt() ? 'is-corrupt' : '',
			this.isBeingDragged() ? 'is-dragdrop-target' : ''
		].join( ' ' );

		return (
			<div
				className={ className }
				draggable='true'
				onDragStart={ this.onDragStart }
				onDragOver={ this.onDragOver }
				onDragEnd={ this.onDragEnd }
				onDrop={ this.onDragEnd }
			>
				{ this.renderLabel() }
				<div className="action-tray">
					{ this.renderDropButton() }
					{ this.renderEditButton() }
					{ this.renderAddButton() }
					{ this.renderCancelButton() }
				</div>
			</div>
		);
	},

	renderDeletedItem: function() {
		return (
			<a className={ 'menus__menu-item is-deleted depth-' + this.props.depth }>
				{ this.renderLabel() }
				<div className="action-tray">
					<button onClick={ this.cancelDelete } className="button">{ this.translate( 'Back' ) }</button>
					<button onClick={ this.confirmDelete } className="button is-primary">{ this.translate( 'Delete Item' ) }</button>
				</div>
			</a>
		);
	},

	renderDropTarget: function( position ) {
		var operation, action;

		if ( ! this.isMoveItemTarget() && ! this.isAddItemTarget() ) {
			return;
		}

		operation = this.isMoveItemTarget() ? 'move' : 'add';
		action = this.isMoveItemTarget() ? this.props.doMoveItem : this.props.doAddItem;

		return (
			<MenuItemDropTarget
				position={ position }
				operation={ operation }
				depth={ position === 'child' ? this.props.depth + 1 : this.props.depth }
				action={ action.bind( null, 'position', position ) }
				className={ 'is-position-' + position } />
		);
	},

	renderNewItem: function( position ) {
		var depth = position === 'child' ? this.props.depth + 1 : this.props.depth;

		if ( this.isAddItemPosition( position ) ) {
			return (
				<MenuEditableItem
					targetId={ this.props.addState.targetId }
					menu={ this.props.addState.menu }
					position={ position }
					depth={ depth }
					itemTypes={ this.props.itemTypes }
					close={ this.cancelCurrentOperation } />
			);
		}
	},

	render: function() {
		var item;

		if ( this.isEditing() ) {
			item = <MenuEditableItem
						initialItem={ this.props.item }
						depth={ this.props.depth }
						close={ this.cancelCurrentOperation }
						markForDeletion={ this.markForDeletion }
						moveState={ this.props.moveState }
						itemTypes={ this.props.itemTypes }
						startMoveItem={ this.startMoveItem } />;
		} else {
			item = this.renderItem();
		}

		return (
			<div>
				<ReactCSSTransitionGroup
					transitionName="menus__droptarget-slidevertical"
					transitionEnterTimeout={ 200 }
					transitionLeaveTimeout={ 200 }>
					{ this.renderDropTarget( 'before' ) }
				</ReactCSSTransitionGroup>

				{ this.renderNewItem( 'before' ) }
				{ item }
				{ this.renderNewItem( 'after' ) }
				{ this.renderNewItem( 'child' ) }

				<ReactCSSTransitionGroup
					transitionName="menus__droptarget-slidevertical"
					transitionEnterTimeout={ 200 }
					transitionLeaveTimeout={ 200 }>
					{ this.renderDropTarget( 'after' ) }
				</ReactCSSTransitionGroup>
				<ReactCSSTransitionGroup
					transitionName="menus__droptarget-slidevertical"
					transitionEnterTimeout={ 200 }
					transitionLeaveTimeout={ 200 }>
					{ this.renderDropTarget( 'child' ) }
				</ReactCSSTransitionGroup>

				<MenuItemList
					depth={ this.props.depth }
					menuData={ this.props.menuData }
					items={ this.props.items }
					setEditItem={ this.props.setEditItem }
					getEditItem={ this.props.getEditItem }
					moveState={ this.props.moveState }
					doMoveItem={ this.props.doMoveItem }
					addState={ this.props.addState }
					doAddItem={ this.props.doAddItem }
					confirmDeleteItem={ this.props.confirmDeleteItem }
					setConfirmDeleteItem={ this.props.setConfirmDeleteItem }
					dragDrop={ this.props.dragDrop } />
			</div>
		);
	}
} );

var EmptyMenu = React.createClass( {

	renderLabel: function() {
		// If we used a <label> instead of a <span> here, we wouldn't be able to
		// grab a menu item by its noticon in FF and IE, for whatever reason.
		return (
			<span className={ 'menu-item-name' }></span>
		);
	},

	addNewItem: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Add First Menu Item Link' );
		this.props.doAddItem( 'position', 'first' );
	},

	render: function() {

		var addFirstItemButton = (
				<ul className="menus__items">
					<a className="menus__menu-item is-empty">
							{ this.renderLabel() }
							<div className="action-tray">
								<span className="menu-item-action add" onClick={ this.addNewItem }>
									{ this.translate( 'Add' ) }
								</span>
							</div>
					</a>
				</ul>
			),
			newItem = (
				<MenuEditableItem
					targetId={ this.props.addState.targetId }
					menu={ this.props.addState.menu }
					position={ this.props.addState.position }
					depth={ this.props.depth }
					itemTypes={ this.props.itemTypes }
					close={ this.props.doAddItem.bind( null, 'cancel') } />
			);

		return (
			<div className="menus__items">
				{ this.props.addState.position ? newItem : addFirstItemButton }
			</div>
		);
	}

} );

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const isRequesting = isRequestingPostTypes( state, siteId );
		const itemTypes = getMenuItemTypes( state, siteId );
		return {
			isRequesting,
			itemTypes,
		};
	}
)( MenuItemList );
