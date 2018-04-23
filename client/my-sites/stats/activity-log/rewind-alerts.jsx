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
import { getRewindAlerts } from 'state/selectors';

export class RewindAlerts extends Component {
	render() {
		const { alerts: { threats }, translate } = this.props;

		if ( ! threats.length ) {
			return null;
		}

		return (
			<Fragment>
				<Card highlight="error">
					{ translate( 'These items require your immediate attention' ) }
				</Card>
				{ threats.map( threat => <ThreatAlert key={ threat.signature } threat={ threat } /> ) }
			</Fragment>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	alerts: getRewindAlerts( state, siteId ),
} );

export default connect( mapStateToProps )( localize( RewindAlerts ) );
