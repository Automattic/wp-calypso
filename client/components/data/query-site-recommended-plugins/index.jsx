/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getRecommendedPlugins from 'state/selectors/get-recommended-plugins';
import { fetchRecommendedPlugins } from 'state/plugins/recommended/actions';

class QuerySiteRecommendedPlugins extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		isLoaded: PropTypes.bool.isRequired,
	};

	componentDidMount() {
		if ( ! this.props.isLoaded ) {
			this.props.fetchRecommendedPlugins( this.props.siteId );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId && ! this.props.isLoaded ) {
			this.props.fetchRecommendedPlugins( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect(
	( state, { siteId } ) => ( {
		isLoaded: !! getRecommendedPlugins( state, siteId ),
	} ),
	{
		fetchRecommendedPlugins,
	}
)( QuerySiteRecommendedPlugins );
