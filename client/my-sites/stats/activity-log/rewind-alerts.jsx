/**
 * External dependencies
 *
 * @format
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getRewindAlerts } from 'state/selectors';

export class RewindAlerts extends Component {
	render() {
		const { alerts: { threats } } = this.props;

		return <Fragment>{ threats.map( threat => <div>Threat!</div> ) }</Fragment>;
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	alerts: getRewindAlerts( state, siteId ),
} );

export default connect( mapStateToProps )( RewindAlerts );
