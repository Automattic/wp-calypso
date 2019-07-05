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
import Card from 'components/card';
import ThreatAlert from './threat-alert';
import { requestSiteAlerts } from 'state/data-getters';

/**
 * Style dependencies
 */
import './rewind-alerts.scss';

export class RewindAlerts extends Component {
	refreshList() {
		//console.log("refreshing!");
		//console.log("this.state BEFORE:", this.state);

		this.setState( {} );
	}

	render() {
		//console.log("RENDERING LIST!!!");
		//console.log("this.state", this.state);

		const { siteId, translate, alerts } = this.props;

		//console.log("siteId", siteId);
		//console.log("alerts:", alerts);

		if ( ! alerts || ! alerts.threats || alerts.threats.length === 0 ) {
			//console.log("A1");
			return null;
		}

		//console.log("B1");

		return (
			<Card className="activity-log__threats" highlight="error">
				<div className="activity-log__threats-heading">
					{ translate( 'These items require your immediate attention' ) }
				</div>
				{ alerts.threats.map( threat => (
					<ThreatAlert siteId={ siteId } key={ threat.id } threat={ threat } parentList={ this } />
				) ) }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	alerts: requestSiteAlerts( siteId ).data,
} );

export default connect( mapStateToProps )( localize( RewindAlerts ) );
