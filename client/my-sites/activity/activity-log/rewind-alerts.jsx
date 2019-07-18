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
import getSiteThreats from 'state/selectors/get-site-threats';

/**
 * Style dependencies
 */
import './rewind-alerts.scss';

export class RewindAlerts extends Component {
	render() {
		const { threats, translate } = this.props;

		if ( ! threats || threats.length === 0 ) {
			return null;
		}

		return (
			<Card className="activity-log__threats" highlight="error">
				<div className="activity-log__threats-heading">
					{ translate( 'These items require your immediate attention' ) }
				</div>
				{ threats.map( threat => (
					<ThreatAlert key={ threat.id } threat={ threat } />
				) ) }
			</Card>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	threats: getSiteThreats( state, siteId ),
} );

export default connect( mapStateToProps )( localize( RewindAlerts ) );
