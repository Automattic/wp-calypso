/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isEmpty, isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { requestThemes } from 'calypso/state/themes/actions';
import { getThemesForQuery, isRequestingThemesForQuery } from 'calypso/state/themes/selectors';

class QueryThemes extends Component {
	static propTypes = {
		siteId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.oneOf( [ 'wpcom', 'wporg' ] ) ] )
			.isRequired,
		// A theme query. Note that on Jetpack sites, only the `search` argument is supported.
		query: PropTypes.shape( {
			// The search string
			search: PropTypes.string,
			// The tier to look for -- 'free', 'premium', or '' (for all themes)
			tier: PropTypes.oneOf( [ '', 'free', 'premium' ] ),
			// Comma-separated list of filters; see my-sites/themes/theme-filters
			filter: PropTypes.string,
			// Which page of the results list to display
			page: PropTypes.number,
			// How many results per page
			number: PropTypes.number,
		} ),
		// Connected props
		hasThemes: PropTypes.bool.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		requestThemes: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.request();
	}

	shouldComponentUpdate( nextProps ) {
		return this.props.siteId !== nextProps.siteId || ! isEqual( this.props.query, nextProps.query );
	}

	componentDidUpdate() {
		this.request();
	}

	request() {
		if ( ! this.props.isRequesting && ! this.props.hasThemes ) {
			this.props.requestThemes( this.props.siteId, this.props.query );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { query, siteId } ) => ( {
		hasThemes: ! isEmpty( getThemesForQuery( state, siteId, query ) ),
		isRequesting: isRequestingThemesForQuery( state, siteId, query ),
	} ),
	{ requestThemes }
)( QueryThemes );
