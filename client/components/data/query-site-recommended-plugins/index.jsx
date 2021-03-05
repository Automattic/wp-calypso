/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchRecommendedPlugins } from 'calypso/state/plugins/recommended/actions';

class QuerySiteRecommendedPlugins extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
	};

	componentDidMount() {
		this.props.fetchRecommendedPlugins( this.props.siteId );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.siteId !== this.props.siteId ) {
			this.props.fetchRecommendedPlugins( this.props.siteId );
		}
	}

	render() {
		return null;
	}
}

export default connect( null, {
	fetchRecommendedPlugins,
} )( QuerySiteRecommendedPlugins );
