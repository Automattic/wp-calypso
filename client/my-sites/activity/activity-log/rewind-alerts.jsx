/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

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

function RewindAlerts( { alerts } ) {
	const translate = useTranslate();

	if ( ! alerts || ! alerts.threats || alerts.threats.length === 0 ) {
		return null;
	}

	return (
		<Card className="activity-log__threats" highlight="error">
			<div className="activity-log__threats-heading">
				{ translate( 'These items require your immediate attention' ) }
			</div>
			{ alerts.threats.map( threat => (
				<ThreatAlert key={ threat.id } threat={ threat } />
			) ) }
		</Card>
	);
}

const mapStateToProps = ( state, { siteId } ) => ( {
	alerts: requestSiteAlerts( siteId ).data,
} );

export default connect( mapStateToProps )( RewindAlerts );
