/**
 * External dependencies
 */
var React = require( 'react' ),
	omit = require( 'lodash/object/omit' ),
	once = require( 'lodash/function/once' ),
	isEqual = require( 'lodash/lang/isEqual' );

/**
 * Internal dependencies
 */
var ThemesStore = require( 'lib/themes/stores/themes' ),
	ThemesListStore = require( 'lib/themes/stores/themes-list' ),
	Actions = require( 'lib/themes/flux-actions' ),
	Constants = require( 'lib/themes/constants' );

function queryThemes( props ) {
	Actions.query( {
		search: props.search,
		tier: props.tier,
		page: 0,
		perPage: Constants.PER_PAGE
	} );

	Actions.fetchNextPage( props.site );
}

function getThemesInList() {
	return ThemesListStore.getThemesList().map( ThemesStore.getById );
}

function getThemesState() {
	return {
		themes: getThemesInList(),
		lastPage: ThemesListStore.isLastPage(),
		loading: ThemesListStore.isFetchingNextPage(),
		search: ThemesListStore.getQueryParams().search
	};
}

let ThemesListFetcher = React.createClass( {
	propTypes: {
		children: React.PropTypes.element.isRequired,
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		isMultisite: React.PropTypes.bool,
		search: React.PropTypes.string,
		tier: React.PropTypes.string,
		onRealScroll: React.PropTypes.func,
		onLastPage: React.PropTypes.func
	},

	getInitialState: function() {
		return Object.assign( getThemesState(), { loading: true } );
	},

	componentDidMount: function() {
		ThemesListStore.on( 'change', this.onThemesChange );
		if ( this.props.site || this.props.isMultisite ) {
			this.queryThemes( this.props );
		}
	},

	componentWillUnmount: function() {
		ThemesListStore.off( 'change', this.onThemesChange );
	},

	componentWillReceiveProps: function( nextProps ) {
		const ignoreProps = [ 'children', 'onLastPage', 'site' ];

		if ( isEqual(
			omit( this.props, ignoreProps ),
			omit( nextProps, ignoreProps ) ) ) {
			return;
		}

		if ( nextProps.site || nextProps.isMultisite ) {
			this.queryThemes( nextProps );
		}
	},

	queryThemes: function( props ) {
		const { onLastPage } = this.props;
		this.onLastPage = onLastPage ? once( onLastPage ) : null;
		queryThemes( props );
	},

	onThemesChange: function() {
		this.setState( getThemesState() );

		const { page } = ThemesListStore.getQueryParams();
		const { loading, lastPage } = this.state;

		if ( page > 1 && ! loading && lastPage ) {
			this.onLastPage && this.onLastPage();
		}
	},

	fetchNextPage: function( options ) {
		// FIXME: While this function is passed on by `ThemesList` to `InfiniteList`,
		// which has a `shouldLoadNextPage()` check (in scroll-helper.js), we can't
		// rely on that; fetching would break without the following check.
		if ( this.state.loading || this.state.lastPage ) {
			return;
		}

		if ( options.triggeredByScroll ) {
			this.props.onRealScroll && this.props.onRealScroll();
		}

		Actions.fetchNextPage( this.props.site );
	},

	render: function() {
		var childrenProps = Object.assign( { fetchNextPage: this.fetchNextPage }, this.state );
		// Clone the child element along and pass along state (containing data from the store)
		return React.cloneElement( this.props.children, childrenProps );
	}

} );

module.exports = ThemesListFetcher;
