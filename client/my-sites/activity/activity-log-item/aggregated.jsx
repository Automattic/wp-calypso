/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */

class ActivityLogAggregatedItem extends Component {
	render() {
		const { translate } = this.props;
		return <p>{ translate( 'I am an aggregated item' ) }</p>;
	}
}

export default connect(
	null,
	null
)( localize( ActivityLogAggregatedItem ) );
