import { Popover, Gridicon } from '@automattic/components';
import React, { Component, createRef } from 'react';
import ReactDom from 'react-dom';
import InfiniteList from 'calypso/components/infinite-list';

const PostPlaceholder = () => null;
const Item = () => null;

class Listing extends React.Component {
	state = {
		items: [
			{ id: 1, name: 'person 1' },
			{ id: 2, name: 'person 2' },
			{ id: 3, name: 'person 3' },
			{ id: 4, name: 'person 4' },
			{ id: 5, name: 'person 5' },
			{ id: 6, name: 'person 6' },
		],
		loading: false,
		lastPage: true,
		listContext: null,
		isOpen: false,
	};

	fetchNextPage( options ) {
		if ( options.triggeredByScroll ) {
			// track analytics events
		}
		// actions.fetchNextPage();
	}

	getItemRef = ( item ) => {
		return 'item-' + item.id;
	};

	renderItem = ( item ) => {
		const itemKey = this.getItemRef( item );
		return (
			<div ref={ itemKey } key={ itemKey }>
				{ item.name }
			</div>
		);
		return <Item ref={ itemKey } key={ itemKey } />;
	};

	renderLoadingPlaceholders() {
		const count = 5; //this.props.list.get().length ? 2 : this.props.list.perPage;
		const placeholders = [];
		// times( count, function ( i ) {
		// 	placeholders.push( <PostPlaceholder key={ 'placeholder-' + i } /> );
		// } );

		return placeholders;
	}

	clickButton = ( j ) => {
		const items = [];
		for ( let i = 0; i < j; i++ ) {
			items.push( { id: i, name: 'person ' + i } );
		}
		this.setState( { items } );
	};

	authorSelectorToggleRef = createRef();
	authorSelectorChevronRef = createRef();

	render() {
		return (
			<div>
				<button
					onClick={ () => this.clickButton( 1 ) }
					style={ { border: '1px solid #888', marginRight: '10px' } }
				>
					set to 1 items
				</button>
				<button
					onClick={ () => this.clickButton( 10 ) }
					style={ { border: '1px solid #888', marginRight: '10px' } }
				>
					set to 10 items
				</button>
				<button
					onClick={ () => this.clickButton( 100 ) }
					style={ { border: '1px solid #888', marginRight: '10px' } }
				>
					set to 100 items
				</button>
				<button
					onClick={ () => this.clickButton( 1000 ) }
					style={ { border: '1px solid #888', marginRight: '10px' } }
				>
					set to 1000 items
				</button>
				<button
					onClick={ () => this.clickButton( 10000 ) }
					style={ { border: '1px solid #888', marginRight: '10px' } }
				>
					set to 10000 items
				</button>
				<br />

				<span>
					<span
						className="author-selector__author-toggle"
						onClick={ this.toggleIsOpen }
						onKeyDown={ this.toggleIsOpen }
						role="button"
						tabIndex={ -1 }
						ref={ this.authorSelectorToggleRef }
					>
						See fake list
						{ this.props.children }
						<Gridicon ref={ this.authorSelectorChevronRef } icon="chevron-down" size={ 18 } />
					</span>
					{ /* // position={ this.props.popoverPosition } */ }
					{ /* 
						onKeyDown={ this.onKeyDown }

                    */ }
					<Popover
						isVisible={ this.state.isOpen }
						onClose={ this.onClose }
						context={ this.authorSelectorChevronRef.current }
						className="author-selector__popover popover"
						ignoreContext={ this.props.ignoreContext }
					>
						<InfiniteList
							items={ this.state.items }
							key={ 'asdf' }
							ref={ this.setListContext }
							context={ this.state.listContext }
							className="author-selector__infinite-list"
							lastPage={ this.state.lastPage }
							fetchingNextPage={ this.state.loading }
							guessedItemHeight="200"
							fetchNextPage={ this.fetchNextPage }
							getItemRef={ this.getItemRef }
							renderItem={ this.renderItem }
							renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
						/>
					</Popover>
				</span>
			</div>
		);
	}

	toggleIsOpen = () => {
		this.setState( {
			isOpen: ! this.state.isOpen,
		} );
	};
	onClose = () => {
		this.setState( { isOpen: false } );
	};
	setListContext = ( infiniteListInstance ) => {
		this.setState( {
			listContext: ReactDom.findDOMNode( infiniteListInstance ),
		} );
	};
}
export default Listing;
