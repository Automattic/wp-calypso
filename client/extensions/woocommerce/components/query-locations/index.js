/** @format */

/**
 * External dependencies
 */

import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import { fetchLocations } from 'woocommerce/state/sites/locations/actions';
import { areLocationsLoaded } from 'woocommerce/state/sites/locations/selectors';

class QueryLocations extends Component {
	static propTypes = {
		fetchLocations: PropTypes.func,
		loaded: PropTypes.bool,
		siteId: PropTypes.number.isRequired,
	};

	componentWillMount = () => {
		const { siteId, loaded } = this.props;

		if ( siteId && ! loaded ) {
			this.props.fetchLocations( siteId );
		}
	};

	componentWillReceiveProps = ( { siteId, loaded } ) => {
		if ( ! siteId ) {
			return;
		}

		if ( siteId !== this.props.siteId && ! loaded ) {
			this.props.fetchLocations( siteId );
		}
	};

	render = () => {
		return null;
	};
}

const mapStateToProps = ( state, ownProps ) => {
	const loaded = areLocationsLoaded( state, ownProps.siteId );

	return {
		loaded,
	};
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators(
		{
			fetchLocations,
		},
		dispatch
	);
};

export default connect( mapStateToProps, mapDispatchToProps )( QueryLocations );
