/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import LocationSearch from 'blocks/location-search';
import { createNotice } from 'state/notices/actions';

class LocationSearchExample extends Component {
	propTypes = {
		createNotice: PropTypes.func.isRequired,
	};

	handlePredictionClick = ( prediction ) => {
		this.props.createNotice(
			'is-info',
			`You clicked the '${ prediction.structured_formatting.main_text }' location`
		);
	};

	render() {
		return (
			<LocationSearch onPredictionClick={ this.handlePredictionClick } />
		);
	}
}

const ConnectedLocationSearchExample = connect( null, { createNotice } )( LocationSearchExample );
ConnectedLocationSearchExample.displayName = 'LocationSearch';
export default ConnectedLocationSearchExample;
