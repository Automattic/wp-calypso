/**
 * External dependencies
 */
var React = require( 'react' ),
	update = require( 'react-addons-update' ),
	cloneDeep = require( 'lodash/cloneDeep' ),
	find = require( 'lodash/find' ),
	debug = require( 'debug' )( 'calypso:menus:editable-item' ); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var siteMenus = require( 'lib/menu-data' ),
	MenuUtils = require( './menu-utils' ),
	observe = require( 'lib/mixins/data-observe' ),
	TaxonomyList = require( './item-options/taxonomy-list' ),
	CategoryOptions = require( './item-options/category-options' ),
	PostList = require( './item-options/post-list' ),
	MenuPanelBackButton = require( './menu-panel-back-button' ),
	analytics = require( 'lib/analytics' ),
	Gridicon = require( 'components/gridicon' );

import { isInjectedNewPageItem } from 'lib/menu-data/menu-data';
import has from 'lodash/has';
/**
 * Components
 */
var Button = React.createClass( {
	render: function() {
		var className = ( this.props.className || '' ) + ' button';
		var gridiconButton = '';

		if ( this.props.icon ) {
			gridiconButton = <Gridicon icon={ this.props.icon } />;
		}

		return (
			<button className={ className } onClick={ this.props.onClick } >
				{ gridiconButton }
				{ this.props.label || '' }
			</button>
		);
	}
} );

var MenuEditableItem = React.createClass( {
	mixins: [ observe( 'itemTypes' ) ],

	componentWillMount: function() {
		this.initializeItemType();
	},

	getInitialState: function() {
		var item,
			newItem = {
				name: this.translate( 'New item', { textOnly: true } ),
				type: 'page',
				type_family: 'post_type',
				status: 'publish'
			};
		// Here we're initialising state from props, this is generally
		// considered an anti-pattern, but we're OK here because MenuEditableItem is
		// a temporary component.
		item = this.isNew() ? newItem : cloneDeep( this.props.initialItem );

		return {
			item: item,
			userChangedName: false,
			placeholderText: this.translate( 'Enter menu label', { textOnly: true } ),
			panelInView: this.isNew() ? 'left' : 'right'
		};
	},

	initializeItemType: function() {
		this.setState( {
			itemType: find( this.props.itemTypes.get(), { name: this.state.item.type } )
		} );
	},

	isNew: function() {
		return ! this.props.initialItem;
	},

	save: function() {
		if ( this.isNew() ) {
			analytics.ga.recordEvent( 'Menus', 'Clicked Add Menu Item Button' );
			siteMenus.addItem( this.state.item, this.props.targetId, this.props.position,
					this.props.menu );
		} else {
			analytics.ga.recordEvent( 'Menus', 'Clicked OK Menu Item Button' );
			siteMenus.updateMenuItem( this.state.item );
		}
		this.props.close();
	},

	remove: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Trash Menu Item Button' );
		this.props.markForDeletion();
		this.props.close();
	},

	updateNameValue: function( event ) {
		if ( ! this.state.firedTitleChangeGAEvent ) {
			analytics.ga.recordEvent( 'Menus', 'Typed in Menu Item Title Field' );
			this.setState( { firedTitleChangeGAEvent: true } );
		}

		this.setState( update( this.state, {
			item: { name: { $set: event.target.value } },
			userChangedName: { $set: true }
		} ) );
	},

	updateUrlValue: function( event ) {
		if ( ! this.state.firedUrlChangeGAEvent ) {
			analytics.ga.recordEvent( 'Menus', 'Typed in Link Address' );
			this.setState( { firedUrlChangeGAEvent : true } );
		}

		this.setState( update( this.state, {
			item: {
				url: { $set: event.target.value },
				type: { $set: this.state.itemType.name },
				type_family: { $set: this.state.itemType.family }
			}
		} ) );
	},

	toggleUrlTarget: function() {
		analytics.ga.recordEvent( 'Menus', 'Set link target' );

		this.setState( update( this.state, {
			item: {
				link_target: { $set: ! this.state.item.link_target ? '_blank' : '' }
			}
		} ) );
	},

	changeItemType: function( itemType ) {
		analytics.ga.recordEvent( 'Menus', 'Clicked ' + itemType.gaEventLabel + ' Menu' );
		this.setState( {
			itemType: itemType,
			panelInView: 'right'
		} );
	},

	/**
	 * Get an item name, used by setItemContent.
	 *
	 * If item is new, and the user hasn't manually changed the title, return
	 * the newly selected content title — otherwise fallback to the current title.
	 *
	 * @return {string} item name
	 */
	getItemName: function( content, currentValue ) {
		if ( this.state.userChangedName || ! this.isNew() ) {
			return currentValue;
		} else if ( isInjectedNewPageItem( content ) ) {
			return '';
		} else {
			return MenuUtils.getContentTitle( content )
		}
	},
	setItemContent: function( content ) {
		analytics.ga.recordEvent( 'Menus', 'Selected Menu Item' );
		this.setState( update( this.state, {
			item: {
				content_id: { $set: content.ID },
				name: { $apply: this.getItemName.bind( null, content ) },
				type: { $set: this.state.itemType.name },
				type_family: { $set: this.state.itemType.family }
			}
		} ) );

		if (
			!this.state.userChangedName &&
			this.isNew() &&
			this.isMounted() &&
			has( this, 'refs.menuLabel' )
		) {
			if ( isInjectedNewPageItem( content ) ) {
				this.refs.menuLabel.focus();
				this.setState( { placeholderText: this.translate( 'Enter page name', { textOnly: true } ) } );
			} else {
				this.setState( { placeholderText: this.translate( 'Enter menu label', { textOnly: true } ) } );
			}
		}
	},

	showLeftPanel: function() {
		this.setState( { panelInView: 'left' } );
	},

	renderItemOptions: function() {
		return this.state.itemType && this[this.state.itemType.renderer]( this.state.itemType );
	},

	renderLinkOptions: function( itemType ) {
		return (
			<div className="menu-item-options menu-item-url">
				<MenuPanelBackButton label={ itemType.label } onClick={ this.showLeftPanel } />
				<label className="menu-item-form-label">{ this.translate( 'Link address (URL)' ) }</label>
				<input className="menu-item-form-address" type="text" value={ this.state.item.url } onChange={ this.updateUrlValue } />
				<input id="menu-flag-open-in-new-window" type="checkbox" defaultChecked={ this.state.item.link_target } onChange={ this.toggleUrlTarget } />
				<label htmlFor="menu-flag-open-in-new-window">{ this.translate( 'Open link in new window/tab' ) }</label>
			</div>
		);
	},

	renderPostOptions: function( itemType ) {
		return (
			<PostList siteID={ siteMenus.siteID }
			  site={ siteMenus.site }
				type={ itemType.name }
				item={ this.state.item }
				back={ this.showLeftPanel }
				onChange={ this.setItemContent }
				itemType={ itemType } />
		);
	},

	renderTaxonomyOptions: function( itemType ) {
		var contentsList = itemType.contentsList;

		if ( contentsList.page === 0 ) {
			contentsList.fetchNextPage();
		}

		return  (
			<TaxonomyList contents={ contentsList }
				item={ this.state.item }
				back={ this.showLeftPanel }
				onChange={ this.setItemContent }
				itemType={ itemType } />
		);
	},

	renderCategoryOptions: function( itemType ) {
		return (
			<CategoryOptions
				siteId={ siteMenus.siteID }
				selected={ this.state.item }
				onBackClick={ this.showLeftPanel }
				itemType={ itemType }
				onChange={ this.setItemContent } />
		);
	},

	renderItemTypes: function() {
		return (
			<ul className="menus__menu-item-form-types">
				{ this.props.itemTypes.get().map( function( itemType ) {
					var isSelected;

					if ( ! itemType.show ) {
						return null;
					}

					isSelected = itemType.name === this.state.itemType.name ? 'is-selected' : '';

					return (
						<li key={ itemType.name } className={ isSelected }
									onClick={ this.changeItemType.bind( null, itemType ) } >
							<label className={ 'noticon noticon-' + ( itemType.icon || 'cog' ) } >
								{ itemType.label }
							</label>
						</li>
						);
					}, this ) }
				</ul>
		);
	},

	renderUnsupportedNotice: function() {
		var title, body, errorInfo;

		title = this.isItemInvalid() ?
			this.translate( 'Sorry, this menu item is invalid and I can\'t edit it.' ) :
			this.translate( 'Sorry, this menu item is unsupported and I can\'t edit it.' );

		body = this.translate( 'You can manage this item as usual, but you cannot edit it here. {{br/}} Check the {{wpAdminLink}}WP Admin{{/wpAdminLink}} and see if you can edit it from there.', {
			components: {
				br: <br />,
				wpAdminLink: <a href={ MenuUtils.getNavMenusUrl() } target="_blank" rel="noopener noreferrer" />
			}
		} );

		errorInfo = [
			'[type: ',
			this.state.item.type || 'none',
			', type_family: ',
			this.state.item.type_family || 'none',
			']'
		].join('');

		return (
			<div className="unsupported-notice">
				<h1>{ title }</h1>
				<p> { body } </p>
				<small>{ errorInfo }</small>
			</div>
		);
	},

	isSupportedItemType: function() {
		if ( ! this.state.itemType ) {
			return false;
		}
		var itemType = find( this.props.itemTypes.get(), { name: this.state.item.type } );
		return itemType && itemType.show;
	},

	isItemInvalid: function() {
		return ! this.state.item.type || ! this.state.item.type_family;
	},

	getItemIcon: function() {
		if ( ! this.isSupportedItemType() || this.isItemInvalid() ) {
			return 'standard';
		}

		return this.state.itemType.icon;
	},

	renderButtons: function() {
		return [
			{
				key: 'remove',
				className: 'is-scary',
				showIfNew: false,
				icon: 'trash',
				onClick: this.remove
			},
			{
				key: 'move',
				label: this.translate( 'Move', { textOnly: true } ),
				showIfNew: false,
				onClick: this.onMoveButtonClick
			},
			{
				key: 'cancel',
				label: this.translate( 'Cancel', { textOnly: true } ),
				showIfNew: true,
				onClick: this.onCancelButtonClick
			},
			{
				key: 'ok',
				className: 'is-primary',
				label: this.isNew() ?
					this.translate( 'Add Item', { textOnly: true } ) :
					this.translate( 'OK', { textOnly: true } ),
				showIfNew: true,
				onClick: this.save
			}
		].map( function( button ) {
			return ( this.isNew() && button.showIfNew ) || ! this.isNew() ? <Button {...button } /> : null;
		}, this );
	},

	onMoveButtonClick: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Move Menu Item Button' );
		this.props.startMoveItem();
	},

	onCancelButtonClick: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Cancel Menu Item Button' );
		this.props.close();
	},

	onTitleClick: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Menu Item Title Field' );
	},

	renderItem: function() {
		return (
			<a className={ 'menus__menu-item is-selected depth-' + this.props.depth }>
				<span className={ 'noticon noticon-' + this.getItemIcon() } />
				<input id="menu-item-name-value"
					placeholder={ this.state.placeholderText }
					ref="menuLabel"
					value={ this.state.item.name }
					onChange={ this.updateNameValue }
					onClick={ this.onTitleClick } />
			</a>
		);
	},

	renderSupportedTypes: function() {
		return ( this.isSupportedItemType() && ! this.isItemInvalid() ) ?
			this.renderItemTypes() :
			this.renderUnsupportedNotice();
	},

	render: function() {
		return (
			<div className={ 'menus__menu-item-open-container is-panel-' + this.state.panelInView }>
				{ this.renderItem() }
				<div className={ 'menus__menu-item-open depth-' + this.props.depth }>
					<div className="editable-item-content">

						<div className="menus__types-and-options-container">
							{ this.renderSupportedTypes() }
							{ this.isSupportedItemType() && this.renderItemOptions() }
						</div>

						<div className="menus__menu-item-actions">
							{ this.renderButtons() }
						</div>

					</div>
				</div>
			</div>
		);
	}
} );


module.exports = MenuEditableItem;
