/**
 * External dependencies
 */
import React from 'react';
import omit from 'lodash/object/omit';
import once from 'lodash/function/once';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Constants from 'lib/themes/constants';
import { query, fetchNextPage } from 'lib/themes/actions';
import {
	getFilteredThemes,
	hasSiteChanged,
	isJetpack,
	isLastPage,
	isFetchingNextPage
} from 'lib/themes/selectors';

function getState( state, { search } ) {
	return {
		themes: getFilteredThemes( state, search ),
		lastPage: isLastPage( state ),
		loading: isFetchingNextPage( state ),
		lastQuery: {
			hasSiteChanged: hasSiteChanged( state ),
			isJetpack: isJetpack( state )
		}
	};
}

const ThemesListFetcher = React.createClass( {
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
		onLastPage: React.PropTypes.func,

		themes: React.PropTypes.array.isRequired,
		lastPage: React.PropTypes.bool.isRequired,
		loading: React.PropTypes.bool.isRequired,
		query: React.PropTypes.func.isRequired,
		fetchNextPage: React.PropTypes.func.isRequired,
	},

	componentDidMount: function() {
		this.refresh( this.props );
	},

	componentWillReceiveProps: function( nextProps ) {
		if (
				nextProps.tier !== this.props.tier || (
					nextProps.search !== this.props.search && (
						! nextProps.lastQuery.isJetpack ||
						nextProps.lastQuery.hasSiteChanged
						)
					)
			) {
			this.refresh( nextProps );
		}
	},

	refresh: function( props ) {
		if ( this.props.site || this.props.isMultisite ) {
			this.queryThemes( props );
		}
	},

	queryThemes: function( props ) {
		const {
			onLastPage,
			site,
			search,
			tier,
		} = props;

		this.onLastPage = onLastPage ? once( onLastPage ) : null;

		this.props.query( {
			search,
			tier,
			page: 0,
			perPage: Constants.PER_PAGE,
		} );

		this.props.fetchNextPage( site );
	},

	fetchNextPage: function( options ) {
		// FIXME: While this function is passed on by `ThemesList` to `InfiniteList`,
		// which has a `shouldLoadNextPage()` check (in scroll-helper.js), we can't
		// rely on that; fetching would break without the following check.
		if ( this.props.loading || this.props.lastPage ) {
			return;
		}

		const {
			site = false,
			onRealScroll = () => null,
		} = this.props;

		if ( options.triggeredByScroll ) {
			onRealScroll();
		}

		this.props.fetchNextPage( site );
	},

	render: function() {
		const props = omit( this.props, 'children' );
		return React.cloneElement( this.props.children, Object.assign( {}, props, {
			fetchNextPage: this.fetchNextPage
		} ) );
	}

} );

export default connect(
	( state, props ) => Object.assign( {},
		props,
		getState( state, props )
	),
	bindActionCreators.bind( null, { query, fetchNextPage } )
)( ThemesListFetcher );
