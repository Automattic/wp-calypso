/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { some } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import CredentialsSetupFlow from './credentials-setup-flow';
import CredentialsConfigured from './credentials-configured';
import Notice from 'components/notice';
import QueryRewindState from 'components/data/query-rewind-state';
import SectionHeader from 'components/section-header';
import { getSelectedSiteId } from 'state/ui/selectors';
import getRewindState from 'state/selectors/get-rewind-state';
import { getSiteSlug } from 'state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackCredentials extends Component {
	render() {
		const { credentials, rewindState, siteId, translate, siteSlug } = this.props;
		const hasAuthorized = rewindState === 'provisioning' || rewindState === 'active';
		const hasCredentials = some( credentials, { role: 'main' } );

		return (
			<div className="jetpack-credentials">
				<QueryRewindState siteId={ siteId } />
				<SectionHeader label={ translate( 'Backups and security scans' ) }>
					{ hasAuthorized && (
						<Notice
							icon="checkmark"
							isCompact
							status="is-success"
							text={ translate( 'Connected' ) }
						/>
					) }
				</SectionHeader>
				{ hasCredentials ? (
					<CredentialsConfigured siteId={ siteId } />
				) : (
					<CredentialsSetupFlow siteId={ siteId } />
				) }
				{ hasCredentials && (
					<CompactCard href={ `/activity-log/${ siteSlug }` }>
						{ translate( "View your site's backups and activity" ) }
					</CompactCard>
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
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( JetpackCredentials ) );
