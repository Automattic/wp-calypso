/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ThreatAlert from './threat-alert';
import { getSiteThreats } from 'state/selectors/get-site-threats';

/**
 * Style dependencies
 */
import './rewind-alerts.scss';

export class RewindAlerts extends Component {
	getRewindAlerts = alerts => {
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
	};
}

const mapStateToProps = ( state, { siteId } ) => ( {
	alerts: getSiteThreats( state, siteId ),
} );

export default connect( mapStateToProps )( RewindAlerts );
