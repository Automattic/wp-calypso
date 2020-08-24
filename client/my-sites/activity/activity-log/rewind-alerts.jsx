/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import ThreatAlert from './threat-alert';
import getSiteThreats from 'state/selectors/get-site-threats';

/**
 * Style dependencies
 */
import './rewind-alerts.scss';

export class RewindAlerts extends Component {
	render() {
		const { siteId, threats, translate } = this.props;

		if ( ! threats || threats.length === 0 ) {
			return null;
		}

		return (
			<Card className="activity-log__threats" highlight="error">
				<div className="activity-log__threats-heading">
					{ translate( 'These items require your immediate attention' ) }
				</div>
				{ 'function' === typeof threats.map &&
					threats.map( ( threat ) => (
						<ThreatAlert key={ threat.id } threat={ threat } siteId={ siteId } />
					) ) }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	threats: getSiteThreats( state, siteId ),
	siteId,
} );

export default connect( mapStateToProps )( localize( RewindAlerts ) );
