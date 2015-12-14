/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import debounce from 'lodash/function/debounce';
import sortBy from 'lodash/collection/sortBy';
import filter from 'lodash/collection/filter';
import camelCase from 'lodash/string/camelCase';
import clone from 'lodash/lang/clone';
import throttle from 'lodash/function/throttle';

/**
 * Internal dependencies
 */
import NoResults from './no-results';
import analytics from 'analytics';
import Search from './search';
import TreeConvert from 'lib/tree-convert';
import postActions from 'lib/posts/actions';

/**
* Constants
*/
const SEARCH_DEBOUNCE_TIME_MS = 500;
const SCROLL_THROTTLE_TIME_MS = 400;
const treeConverter = new TreeConvert( 'ID' );

function sortBranch( items ) {
	let menuOrders = filter( items, function( item ) {
		return item.menu_order > 0;
	} );

	return sortBy( items, function( item ) {
		if ( menuOrders.length ) {
			return item.menu_order;
		}

		return item.title.toLowerCase();
	} );
}

function buildTree( items ) {
	const sortedPosts = [];

	// clone objects to prevent mutating store data, set parent to number
	items.forEach( function( item ) {
		let post = clone( item );
		post.parent = post.parent ? post.parent.ID : 0;
		sortedPosts.push( post );
	} );

	return treeConverter.treeify( sortedPosts );
}

export default React.createClass( {
	displayName: 'PostSelectorPosts',

	propTypes: {
		listId: PropTypes.number,
		posts: PropTypes.array,
		postImages: PropTypes.object,
		page: PropTypes.number,
		lastPage: PropTypes.bool,
		loading: PropTypes.bool,
		emptyMessage: PropTypes.string,
		createLink: PropTypes.string,
		selected: PropTypes.number,
		onSearch: PropTypes.func,
		multiple: PropTypes.bool
	},

	getInitialState() {
		return {
			searchTerm: null
		};
	},

	getDefaultProps() {
		return {
			analyticsPrefix: 'Post Selector',
			searchThreshold: 8,
			loading: true,
			emptyMessage: ''
		};
	},

	componentDidMount() {
		this.checkScrollPosition = throttle( function() {
			const node = ReactDom.findDOMNode( this );

			if ( ( node.scrollTop + node.clientHeight ) >= node.scrollHeight ) {
				this.maybeFetchNextPage();
			}
		}, SCROLL_THROTTLE_TIME_MS ).bind( this );
	},

	componentWillMount() {
		this.debouncedSearch = debounce( function() {
			this.props.onSearch( this.state.searchTerm );
		}.bind( this ), SEARCH_DEBOUNCE_TIME_MS );
	},

	hasNoSearchResults() {
		return ! this.props.loading &&
			( this.props.posts && ! this.props.posts.length ) &&
			this.state.searchTerm;
	},

	hasNoPosts() {
		return ! this.props.loading && ( this.props.posts && ! this.props.posts.length );
	},

	renderItem( item ) {
		const itemId = item.ID;
		const name = item.title || this.translate( 'Untitled' );
		const checked = this.props.selected === item.ID;
		const inputType = this.props.multiple ? 'checkbox' : 'radio';
		const domId = camelCase( this.props.analyticsPrefix ) + '-option-' + itemId;

		const input = (
			<input id={ domId } type={ inputType } name='posts'
				value={ itemId }
				onChange={ this.props.onChange.bind( null, item ) }
				checked={ checked } />
		);

		return (
			<li key={ 'post-' + itemId } className="post-selector__list-item">
				<label>
					{ input }
					<span className="post-selector__label">{ name }</span>
				</label>
				{ item.items ? this.renderHierarchy( item.items, true ) : null }
			</li>
		);
	},

	onSearch( event ) {
		const newSearch = event.target.value;

		if ( this.state.searchTerm && ! newSearch.length ) {
			this.props.onSearch( null );
		}

		if ( newSearch !== this.state.searchTerm ) {
			analytics.ga.recordEvent( this.props.analyticsPrefix, 'Performed Post Search' );
			this.setState( { searchTerm: event.target.value } );
			this.debouncedSearch();
		}
	},

	renderHierarchy( items, isRecursive ) {
		const sortedItems = this.props.lastPage ? sortBranch( items ) : items;
		const listClass = isRecursive ? 'post-selector__nested-list' : 'post-selector__list';

		return (
			<ul className={ listClass }>
				{ sortedItems.map( this.renderItem, this ) }
				{
					this.props.loading && ! isRecursive ?
					this.renderPlaceholderItem() :
					null
				}
			</ul>
		);
	},

	renderPlaceholderItem() {
		const inputType = this.props.multiple ? 'checkbox' : 'radio';

		return (
			<li>
				<input className='placeholder-text' type={ inputType } name='posts' disabled={ true } />
				<label><span className='placeholder-text'>Loading list of options...</span></label>
			</li>
		);
	},

	renderPlaceholder() {
		return ( <ul>{ this.renderPlaceholderItem() }</ul> );
	},

	maybeFetchNextPage() {
		if ( this.props.lastPage || this.props.loading ) {
			return;
		}

		postActions.fetchNextPage();
	},

	render() {
		const numberPosts = this.props.posts ? this.props.posts.length : 0;
		const showSearch = ( numberPosts > this.props.searchThreshold ) || this.state.searchTerm;
		let posts;

		if ( this.props.posts ) {
			// Only build tree if all pages are loaded, and not searching
			posts = ( this.props.lastPage && ! this.state.searchTerm ) ? buildTree( this.props.posts ) : this.props.posts;
		}

		const classes = classNames(
			'post-selector',
			this.props.className, {
				'is-loading': this.props.loading,
				'is-compact': ! showSearch && ! this.props.loading
			}
		);

		return (
			<div className={ classes } onScroll={ this.checkScrollPosition }>
				{ showSearch ?
					<Search searchTerm={ this.state.searchTerm } onSearch={ this.onSearch } /> :
					null
				}
				{
					this.hasNoSearchResults() ?
					<NoResults createLink={ this.props.createLink } noResultsMessage={ this.props.noResultsMessage } /> :
					null
				}
				{
					this.hasNoPosts() ?
					<span className='is-empty-content'>{ this.props.emptyMessage }</span> :
					null
				}
				<form>
					{ posts ? this.renderHierarchy( posts ) : this.renderPlaceholder() }
				</form>
			</div>
		);
	}
} );
