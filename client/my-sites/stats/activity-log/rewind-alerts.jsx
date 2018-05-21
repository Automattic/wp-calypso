/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import ThreatAlert from './threat-alert';
import { requestSiteAlerts } from 'state/data-getters';

export class RewindAlerts extends Component {
	render() {
		const { alerts, translate } = this.props;

		if ( ! alerts ) {
			return null;
		}

		const { threats } = alerts;

		return (
			<Fragment>
				{ threats.length > 0 && (
					<Fragment>
						<Card highlight="error">
							{ translate( 'These items require your immediate attention' ) }
						</Card>
						{ threats.map( threat => <ThreatAlert key={ threat.id } threat={ threat } /> ) }
					</Fragment>
				) }
			</Fragment>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	alerts: requestSiteAlerts( siteId ).data,
} );

export default connect( mapStateToProps )( localize( RewindAlerts ) );
