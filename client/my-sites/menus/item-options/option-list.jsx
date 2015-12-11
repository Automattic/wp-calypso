/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	throttle = require( 'lodash/function/throttle' ),
	debounce = require( 'lodash/function/debounce' ),
	debug = require( 'debug' )( 'calypso:menus:option-list' ); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var MenuPanelBackButton = require( '../menu-panel-back-button' ),
		EmptyPlaceholder = require( './empty-placeholder' ),
		LoadingPlaceholder = require( './loading-placeholder' ),
		Gridicon = require( 'components/gridicon' );
/**
 * Constants
 */
var SCROLL_THROTTLE_TIME_MS = 400,
	SEARCH_DEBOUNCE_TIME_MS = 500;

/**
 * Component
 */
var Search = React.createClass( {
	propTypes: {
		searchTerm: React.PropTypes.string,
		onSearch: React.PropTypes.func.isRequired
	},

	render: function() {
		return (
			<div className="search-container">
				<Gridicon icon="search" size={ 18 } />
				<input type="search" className="search-box"
					placeholder={ this.translate( 'Search…', { textOnly: true } ) }
					value={ this.props.searchTerm }
					onChange={ this.props.onSearch } />
			</div>
		);
	}
} );

var OptionList = React.createClass( {
	propTypes: {
		itemType: React.PropTypes.object.isRequired,
		onScroll: React.PropTypes.func.isRequired,
		onBackClick: React.PropTypes.func.isRequired,
		onSearch: React.PropTypes.func.isRequired,
		isEmpty: React.PropTypes.bool.isRequired,
		isLoading: React.PropTypes.bool.isRequired
	},

	getInitialState: function() {
		return {
			searchTerm: null
		};
	},

	componentWillMount: function() {
		this.debouncedSearch = debounce( function() {
			this.props.onSearch( this.state.searchTerm );
		}.bind( this ), SEARCH_DEBOUNCE_TIME_MS );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.itemType.name !== this.props.itemType.name ) {
			this.setState( { searchTerm: null } );
			this.props.onSearch( null );
		}
	},

	checkScrollPosition: throttle( function() {
		var node = ReactDom.findDOMNode( this );

		if ( node.scrollTop + node.clientHeight >= node.scrollHeight ) {
			this.props.onScroll();
		}
	}, SCROLL_THROTTLE_TIME_MS ),

	onSearch: function( event ) {
		this.setState( { searchTerm: event.target.value } );
		this.debouncedSearch();
	},

	render: function() {
		return (
			<div className="menu-item-options" onScroll={ this.checkScrollPosition }>
				<MenuPanelBackButton label={ this.props.itemType.label } onClick={ this.props.onBackClick } />
				{ ( ( ! this.props.isEmpty && ! this.props.isLoading ) || this.state.searchTerm !== null ) &&
					<Search searchTerm={ this.state.searchTerm }
						onSearch={ this.onSearch } />
				}
				<form>
					{ this.props.children }
					{ this.props.isLoading && <LoadingPlaceholder/> }
					{ this.props.isEmpty &&
						<EmptyPlaceholder isSearch={ !! ( this.state.searchTerm && this.state.searchTerm.length ) }
							createLink={ this.props.itemType.createLink }
							typeName={ this.props.itemType.name } />
					}
				</form>
			</div>
		);
	}
} );

module.exports = OptionList;
