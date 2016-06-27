/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	classNames = require( 'classnames' ),
	unescapeString = require( 'lodash/unescape' ),
	isEqual = require( 'lodash/isEqual' ),
	debounce = require( 'lodash/debounce' ),
	throttle = require( 'lodash/throttle' ),
	camelCase = require( 'lodash/camelCase' ),
	sortBy = require( 'lodash/sortBy' ),
	debug = require( 'debug' )( 'calypso:my-sites:category-selector' );

/**
 * Internal dependencies
 */
var NoResults = require( './no-results' ),
	analytics = require( 'lib/analytics' ),
	Search = require( './search' );

/**
* Constants
*/
var SCROLL_THROTTLE_TIME_MS = 400,
	SEARCH_DEBOUNCE_TIME_MS = 500;

function sortBranch( items ) {
	return sortBy( items, function( item ) {
		return item.name.toLowerCase();
	} );
}

module.exports = React.createClass( {
	displayName: 'CategorySelector',

	propTypes: {
		categories: React.PropTypes.array,
		categoriesFound: React.PropTypes.number,
		categoriesHasNextPage: React.PropTypes.bool,
		categoriesFetchingNextPage: React.PropTypes.bool,
		categoriesFetchNextPage: React.PropTypes.func,
		multiple: React.PropTypes.bool,
		className: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired,
		selected: React.PropTypes.array,
		createLink: React.PropTypes.string,
		analyticsPrefix: React.PropTypes.string,
		searchThreshold: React.PropTypes.number,
		defaultCategoryId: React.PropTypes.number
	},

	getInitialState: function() {
		return {
			searchTerm: '',
			selectedIds: this.getSelectedIds()
		};
	},

	getDefaultProps: function() {
		return {
			analyticsPrefix: 'Category Selector',
			searchThreshold: 8,
			selected: [],
			defaultCategoryId: null
		};
	},

	componentWillMount: function() {
		this.debouncedSearch = debounce( function() {
			this.props.onSearch( this.state.searchTerm );
		}.bind( this ), SEARCH_DEBOUNCE_TIME_MS );
	},

	componentWillReceiveProps: function( nextProps ) {
		var nextSelectedIds = this.getSelectedIds( nextProps.selected );

		if ( nextProps.categories &&
				this.props.categories &&
				nextSelectedIds.length === ( this.state.selectedIds.length + 1 ) &&
				nextProps.categories.length === ( this.props.categories.length + 1 ) ) {
			ReactDom.findDOMNode( this.refs.wrapper ).scrollTop = 0;
		}

		if ( ! isEqual( nextSelectedIds, this.state.selectedIds ) ) {
			this.setState( { selectedIds: nextSelectedIds } );
		}
	},

	hasNoSearchResults: function() {
		return ! this.props.categoriesFetchingNextPage &&
			( this.props.categories && ! this.props.categories.length ) &&
			this.state.searchTerm;
	},

	// this logic is redundant to similar checks in lib/terms/actions, but I would like to capture ga events here
	maybeFetchNextPage: function() {
		if ( this.props.categoriesHasNextPage ) {
			debug( 'fetching next page' );
			analytics.ga.recordEvent( this.props.analyticsPrefix, 'Fetched More Categories' );
			this.props.categoriesFetchNextPage();
		}
	},

	checkScrollPosition: throttle( function() {
		var node = ReactDom.findDOMNode( this );

		if ( node.scrollTop + node.clientHeight >= node.scrollHeight ) {
			this.maybeFetchNextPage();
		}
	}, SCROLL_THROTTLE_TIME_MS ),

	getSelectedIds: function( selected ) {
		var selectedObjects = selected || this.props.selected;
		return selectedObjects.map( function( item ) {
			if ( ! item.ID ) {
				return item;
			}

			return item.ID;
		} );
	},

	renderItem: function( item ) {
		var itemId = item.ID,
			name = unescapeString( item.name ) || this.translate( 'Untitled' ),
			checked = ( -1 !== this.state.selectedIds.indexOf( item.ID ) ),
			inputType = this.props.multiple ? 'checkbox' : 'radio',
			domId = camelCase( this.props.analyticsPrefix ) + '-option-' + itemId,
			disabled,
			input;

		if ( this.props.multiple && checked && this.props.defaultCategoryId &&
				( 1 === this.state.selectedIds.length ) &&
				( this.props.defaultCategoryId === itemId ) ) {
			disabled = true;
		}

		input = (
			<input id={ domId } type={ inputType } name='categories'
				value={ itemId }
				onChange={ this.props.onChange.bind( null, item ) }
				disabled={ disabled }
				checked={ checked } />
		);

		return (
			<li key={ 'category-' + itemId }>
				<label>{ input } { name }</label>
				{ item.items ? this.renderHierarchy( item.items, true ) : null }
			</li>
		);
	},

	onSearch: function( event ) {
		var newSearch = event.target.value;

		if ( this.state.searchTerm && ! newSearch.length ) {
			this.props.onSearch( null );
		}

		if ( newSearch !== this.state.searchTerm ) {
			analytics.ga.recordEvent( this.props.analyticsPrefix, 'Performed Category Search' );
			this.setState( { searchTerm: event.target.value } );
			this.debouncedSearch();
		}
	},

	renderHierarchy: function( items, isRecursive ) {
		var depth = isRecursive ? '' : 'depth-0';

		items = sortBranch( items );

		return (
			<ul className={ depth }>
				{ items.map( this.renderItem, this ) }
				{
					this.props.categoriesFetchingNextPage && ! isRecursive ?
					this.renderPlaceholderItem() :
					null
				}
			</ul>
		);
	},

	renderPlaceholderItem: function() {
		var inputType = this.props.multiple ? 'checkbox' : 'radio';

		return (
			<li>
				<input className='placeholder-text' type={ inputType } name='categories' disabled={ true } />
				<label><span className='placeholder-text'>Loading list of options...</span></label>
			</li>
		);
	},

	renderPlaceholder: function( ) {
		return ( <ul>{ this.renderPlaceholderItem() }</ul> );
	},

	render: function() {
		var numberCategories = this.props.categoriesFound || 0,
			showSearch = ( numberCategories > this.props.searchThreshold ) || this.state.searchTerm;
		debug( 'rendering category selector', this.props );

		const classes = classNames(
			'category-selector',
			this.props.className, {
				'is-loading': this.props.categoriesFetchingNextPage,
				'is-compact': ! showSearch && ! this.props.categoriesFetchingNextPage
			}
		);

		return (
			<div onScroll={ this.checkScrollPosition } className={ classes } ref="wrapper">
				{ this.props.children }
				{ showSearch ?
					<Search searchTerm={ this.state.searchTerm } onSearch={ this.onSearch } />
					: null
				}
				{
					this.hasNoSearchResults() ?
					<NoResults createLink={ this.props.createLink } />
					: null
				}
				<form>
					{ this.props.categories ? this.renderHierarchy( this.props.categories ) : this.renderPlaceholder() }
				</form>
			</div>
		);
	}
} );
