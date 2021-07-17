/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */

/**
 * Show some basic site stats to illustrate the benefits of Jetpack
 */
class JetpackBenefitsSiteStats extends React.Component {
	render() {
		// query the site stats here
		return 'Site Stats';
	}
}

export default connect( () => {
	return {};
}, {} )( JetpackBenefitsSiteStats );
