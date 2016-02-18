/**
 * External dependencies
 */
var React = require( 'react' ),
	assign = require( 'lodash/assign' ),
	isEqual = require( 'lodash/isEqual' ),
	debug = require( 'debug' )( 'calypso:components:data:category-list' );

/**
 * Internal dependencies
 */
var TermActions = require( 'lib/terms/actions' ),
	passToChildren = require( 'lib/react-pass-to-children' ),
	CategoryStoreFactory = require( 'lib/terms/category-store-factory' );

function getStateData( categoryStoreId, siteId ) {
	var categoryStore = CategoryStoreFactory( categoryStoreId );
	return {
		categories: categoryStore.all( siteId ),
		categoriesFound: categoryStore.found( siteId ),
		categoriesHasNextPage: categoryStore.hasNextPage( siteId ),
		categoriesFetchingNextPage: categoryStore.isFetchingPage( siteId )
	};
}

module.exports = React.createClass( {
	displayName: 'CategoryList',

	propTypes: {
		siteId: React.PropTypes.number.isRequired,
		search: React.PropTypes.string,
		categoryStoreId: React.PropTypes.string
	},

	getDefaultProps: function() {
		return {
			categoryStoreId: 'default'
		};
	},

	getInitialState: function() {
		return getStateData( this.props.categoryStoreId, this.props.siteId );
	},

	getCategoryStore: function() {
		return CategoryStoreFactory( this.props.categoryStoreId );
	},

	componentDidMount: function() {
		var siteId, query, categoryStoreId, categoryStore;

		categoryStoreId = this.props.categoryStoreId;
		categoryStore = this.getCategoryStore();
		siteId = this.props.siteId;
		query = this.getQuery();

		setTimeout( function() {
			TermActions.setCategoryQuery( siteId, query, categoryStoreId );
		}, 0 );
		categoryStore.on( 'change', this.updateState );
		this.maybeFetchData( siteId );
	},

	componentWillUnmount: function() {
		var categoryStore = this.getCategoryStore();
		categoryStore.removeListener( 'change', this.updateState );
	},

	componentWillReceiveProps: function( nextProps ) {
		var nextQuery = this.getQuery( nextProps );
		if ( ! isEqual( this.getQuery(), nextQuery ) || nextProps.siteId !== this.props.siteId ) {
			debug( 'updating state and possibly fetching data', nextQuery );
			TermActions.setCategoryQuery( nextProps.siteId, nextQuery, this.props.categoryStoreId );
			this.updateState( nextProps.siteId );
			this.maybeFetchData( nextProps.siteId );
		}
	},

	fetchData: function() {
		debug( 'fetchData called', this.props.siteId );
		TermActions.fetchNextCategoryPage( this.props.siteId, this.props.categoryStoreId );
	},

	getQuery: function( props ) {
		var query = {};

		props = props || this.props;

		if ( props.search ) {
			query.search = props.search;
		}

		return query;
	},

	maybeFetchData: function( siteId ) {
		var categoryStore = this.getCategoryStore(),
			categoryStoreId = this.props.categoryStoreId;

		if ( categoryStore.all( siteId ) ) {
			return;
		}

		debug( 'calling fetchNextCategoryPage', siteId );
		setTimeout( function() {
			TermActions.fetchNextCategoryPage( siteId, categoryStoreId );
		}, 0 );
	},

	updateState: function( siteId ) {
		this.setState( getStateData( this.props.categoryStoreId, siteId || this.props.siteId ) );
	},

	render: function() {
		debug( 'rendering category data for site ' + this.props.siteId + ' and categoryStore: ' + this.props.categoryStoreId, this.state );
		return passToChildren( this, assign( {}, this.state, {
			categoriesFetchNextPage: this.fetchData
		} ) );
	}
} );
