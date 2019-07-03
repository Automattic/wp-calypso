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

const refreshList = () => {
	//TODO: REFRESH LIST HERE!
};

export class RewindAlerts extends Component {
	render() {
		const { siteId, alerts, translate } = this.props;
		if ( ! alerts || ! alerts.threats || alerts.threats.length === 0 ) {
			return null;
		}

		return (
			<Card className="activity-log__threats" highlight="error">
				<div className="activity-log__threats-heading">
					{ translate( 'These items require your immediate attention' ) }
				</div>
				{ alerts.threats.map( threat => (
					<ThreatAlert
						siteId={ siteId }
						key={ threat.id }
						threat={ threat }
						refreshList={ refreshList }
					/>
				) ) }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	alerts: requestSiteAlerts( siteId ).data,
} );

export default connect( mapStateToProps )( localize( RewindAlerts ) );
