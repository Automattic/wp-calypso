/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:menus:taxonomy-list' );

/**
 * Internal dependencies
 */
var siteMenus = require( 'lib/menu-data' ),
		OptionList = require( './option-list' ),
		Options = require( './options' ),
		observe = require( 'lib/mixins/data-observe' ),
		analytics = require( 'lib/analytics' );

/**
 * Component
 */
var TaxonomyList = React.createClass( {
	mixins: [ observe( 'contents' ) ],

	getInitialState: function() {
		return {
			loading: !! this.props.contents.fetchingNextPage,
			hasNeverFetched: true
		};
	},

	reportCategoriesListFetching: function() {
		var categories = this.props.contents;
		if ( 'CategoriesList' === categories.constructor.name &&
				this.state.hasNeverFetched ) {
			this.state.hasNeverFetched = false;
			analytics.ga.recordEvent( 'Menus', 'Fetched More Categories',
					'totalFound', categories.found );
		}
	},

	nextPage: function() {
		if ( ! this.props.contents.fetchNextPage ) {
			return;
		}

		debug( 'fetchingNextPage' );
		this.props.contents.once( 'change', this.reportCategoriesListFetching );
		this.props.contents.fetchNextPage();
		this.setState( { loading: this.props.contents.fetchingNextPage } );
	},

	onSearch: function( term ) {
		this.props.contents.setSearch( term );
		this.props.contents.fetchNextPage();
	},

	render: function() {
		var options = this.props.contents.get( siteMenus.siteID );

		return (
			<OptionList itemType={ this.props.itemType }
				onScroll={ this.nextPage }
				onBackClick={ this.props.back }
				onSearch={ this.onSearch }
				isEmpty={ options.length === 0 && ! this.props.contents.fetchingNextPage }
				isLoading={ this.props.contents.fetchingNextPage && ! this.props.contents.lastPage } >
					<Options item={ this.props.item }
						itemType={ this.props.itemType }
						options={ options }
						onChange={ this.props.onChange }
					/>
			</OptionList>
		);
	}

} );

module.exports = TaxonomyList;
