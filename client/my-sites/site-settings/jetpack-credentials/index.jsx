/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import CredentialsSetupFlow from './credentials-setup-flow';
import CredentialsConfigured from './credentials-configured';
import Gridicon from 'gridicons';
import QueryRewindState from 'components/data/query-rewind-state';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getRewindState } from 'state/selectors';

class JetpackCredentials extends Component {
	render() {
		const { credentials, rewindState, siteId, translate } = this.props;
		const hasAuthorized = rewindState === 'provisioning' || rewindState === 'active';
		const hasCredentials = credentials && credentials.length > 0;

		return (
			<div className="jetpack-credentials">
				<QueryRewindState siteId={ siteId } />
				<CompactCard className="jetpack-credentials__header">
					<span>{ translate( 'Backups and security scans' ) }</span>
					{ hasAuthorized && (
						<span className="jetpack-credentials__connected">
							<Gridicon
								icon="checkmark"
								size={ 18 }
								className="jetpack-credentials__connected-checkmark"
							/>
							{ translate( 'Connected' ) }
						</span>
					) }
				</CompactCard>
				{ hasCredentials ? (
					<CredentialsConfigured siteId={ siteId } />
				) : (
					<CredentialsSetupFlow siteId={ siteId } />
				) }
			</div>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const { credentials, state: rewindState } = getRewindState( state, siteId );

	return {
		credentials,
		rewindState,
		siteId,
	};
} )( localize( JetpackCredentials ) );
