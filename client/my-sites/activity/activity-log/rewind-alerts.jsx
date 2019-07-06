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

let refreshFlag = false;

export class RewindAlerts extends Component {
	refreshList() {
		refreshFlag = true;
		this.setState( {} );
	}

	render() {
		const { siteId, translate, alerts } = this.props;

		if ( ! alerts || ! alerts.threats || alerts.threats.length === 0 ) {
			return null;
		}

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

const requestStuff = siteId => {
	const output = requestSiteAlerts( siteId, refreshFlag ).data;
	refreshFlag = false;
	return output;
};

const mapStateToProps = ( state, { siteId } ) => ( {
	alerts: requestStuff( siteId ),
} );

export default connect( mapStateToProps )( localize( RewindAlerts ) );
