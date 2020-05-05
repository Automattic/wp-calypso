/**
 * External dependencies
 */
import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import { Button, Dashicon } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { registerBlockType } from '@wordpress/blocks';
import { RichText } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { ItemEditor } from './item';

import './editor.scss';

const blockAttributes = {
	list: {
		type: 'array',
		source: 'children',
		selector: 'ul',
		default: [],
	},
};

const itemLineRegex = /^([ ]{0,3})([xo#*-])(\s+)(.*)/;

const edit = class extends Component {
	constructor() {
		super( ...arguments );
		this.addNewItem = this.addNewItem.bind( this );
		this.updateItem = this.updateItem.bind( this );
		this.deleteItem = this.deleteItem.bind( this );
		this.insertNewItemAfter = this.insertNewItemAfter.bind( this );

		// set the initial items in the state based on the markup that was saved
		const list = this.props.attributes.list.filter(
			( item ) => typeof item !== 'string' || item.trim() !== ''
		);
		const items = list.map( ( item ) => {
			const itemEntry = {};
			const children = item.props.children;
			const levelSpan = children[ 0 ];
			const statusSpan = children[ 1 ];
			const valueSpan = children[ 2 ];
			itemEntry.level =
				undefined !== levelSpan.props.children ? levelSpan.props.children.length : 0;
			itemEntry.done = 'x' === statusSpan.props.children;
			// children if it came from html, value if it came from a migration
			itemEntry.value = valueSpan.props.children || valueSpan.props.value;
			return itemEntry;
		} );

		this.state = {
			items,
			newItemAt: undefined,
		};
	}

	componentDidMount() {
		if ( 0 === this.state.items.length ) {
			this.addNewItem();
		}
	}

	getNewItem() {
		return {
			value: [],
			done: false,
			level: 0,
		};
	}

	insertNewItemAfter( index ) {
		const { items } = this.state;
		items.splice( index + 1, 0, this.getNewItem() );
		this.setState( { items: items, newItemAt: index + 1 } );
	}

	addNewItem() {
		const { items } = this.state;
		items.push( this.getNewItem() );
		this.setState( { items, newItemAt: items.length - 1 } );
	}

	swapItems( itemIdx, newIdx ) {
		const { items } = this.state;
		const item = items[ itemIdx ];
		const tmp = items[ newIdx ];
		items[ newIdx ] = item;
		items[ itemIdx ] = tmp;
		this.setState( { items } );
		this.props.setAttributes( { list: this.renderElements( items ) } );
	}

	moveUp( itemIdx ) {
		if ( itemIdx > 0 ) {
			this.swapItems( itemIdx, itemIdx - 1 );
		}
	}

	moveDown( itemIdx ) {
		if ( itemIdx < this.state.items.length - 1 ) {
			this.swapItems( itemIdx, itemIdx + 1 );
		}
	}

	moveLeft( itemIdx ) {
		const { items } = this.state;
		if ( items[ itemIdx ].level > 0 ) {
			items[ itemIdx ].level--;
		}
		this.setState( { items } );
		this.props.setAttributes( { list: this.renderElements( items ) } );
	}

	moveRight( itemIdx ) {
		const { items } = this.state;
		if ( items[ itemIdx ].level < 3 && itemIdx > 0 ) {
			items[ itemIdx ].level++;
		}
		this.setState( { items } );
		this.props.setAttributes( { list: this.renderElements( items ) } );
	}

	deleteItem( index ) {
		const { items } = this.state;
		const newItems = items.filter( ( item, itemIndex ) => {
			return index !== itemIndex;
		} );
		this.setState( { items: newItems, newItemAt: undefined } );
		this.props.setAttributes( { list: this.renderElements( newItems ) } );
	}

	updateItem() {
		this.props.setAttributes( { list: this.renderElements( this.state.items ) } );
	}

	renderElements( items ) {
		const x = items.map( ( item ) => {
			const done = item.done ? 'x' : 'o';
			return (
				<li>
					<span>{ ''.repeat( item.level ) }</span>
					<span>{ done }</span>
					<RichText.Content tagName="span" value={ item.value } />
				</li>
			);
		} );
		return x;
	}

	render() {
		const { className } = this.props;
		const { items, newItemAt } = this.state;
		return (
			<div className={ className }>
				<ul className={ `${ className }__list` }>
					{ items.map( ( item, itemIndex ) => {
						const moveUp = () => {
							this.moveUp( itemIndex );
						};
						const moveDown = () => {
							this.moveDown( itemIndex );
						};
						const moveLeft = () => {
							this.moveLeft( itemIndex );
						};
						const moveRight = () => {
							this.moveRight( itemIndex );
						};
						const onDelete = () => {
							this.deleteItem( itemIndex );
						};
						const onChange = ( updatedItem ) => {
							this.updateItem( updatedItem, itemIndex );
						};
						const onSplit = () => {
							this.insertNewItemAfter( itemIndex );
						};
						const classNames = classnames( `${ className }__item`, {
							[ `${ className }__item--done` ]: item.done,
						} );

						// if we've inserted an item at this index, and it does not have a value, request focus
						const shouldFocusThisItem =
							itemIndex === newItemAt && ( ! item.value || 0 === item.value.length );

						return (
							<ItemEditor
								moveUp={ moveUp }
								moveDown={ moveDown }
								moveLeft={ moveLeft }
								moveRight={ moveRight }
								canMoveUp={ itemIndex > 0 }
								canMoveDown={ itemIndex < items.length - 1 }
								classNames={ classNames }
								item={ item }
								onDelete={ onDelete }
								onChange={ onChange }
								onSplit={ onSplit }
								shouldFocus={ shouldFocusThisItem }
							/>
						);
					} ) }
				</ul>
				<div class="add-new-todo-item-form">
					<Button onClick={ this.addNewItem }>
						<Dashicon icon="plus" /> Add new item
					</Button>
				</div>
			</div>
		);
	}
};

const deprecated = [
	{
		attributes: {
			items: {
				type: 'string',
			},
		},

		save: function () {
			return [];
		},

		migrate: function ( attributes ) {
			const o2list = decodeURIComponent( atob( attributes.items ) );
			const o2Items = o2list.split( '\n' );
			const items = [];

			for ( let i = 0; i < o2Items.length; i++ ) {
				const line = o2Items[ i ];
				const lineMatch = line.match( itemLineRegex );
				if ( ! lineMatch ) {
					continue;
				}
				const done = lineMatch[ 2 ] === 'x';
				const item = lineMatch[ 4 ];
				const level = lineMatch[ 1 ].length;
				items.push( { item, done, level } );
			}

			const list = items.map( ( item ) => {
				const done = item.done ? 'x' : 'o';
				return (
					<li>
						<span>{ ''.repeat( item.level ) }</span>
						<span>{ done }</span>
						<RichText.Content tagName="span" value={ item.item } />
					</li>
				);
			} );
			return { list };
		},
	},
];

const save = class extends Component {
	render() {
		const list = this.props.attributes.list.filter(
			( item ) => typeof item !== 'string' || item.trim() !== ''
		);
		return <ul>{ list }</ul>;
	}
};

registerBlockType( 'a8c/todo', {
	title: __( 'Task List' ),
	icon: 'editor-ul',
	category: 'a8c',
	keywords: [ __( 'todo' ) ],
	attributes: blockAttributes,
	edit,
	save,
	deprecated,
} );
