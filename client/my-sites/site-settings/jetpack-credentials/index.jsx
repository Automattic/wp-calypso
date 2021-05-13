/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import CredentialsConfigured from './credentials-configured';
import Notice from 'calypso/components/notice';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import RewindCredentialsForm from 'calypso/components/rewind-credentials-form';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackCredentials extends Component {
	isSectionHighlighted() {
		if ( ! window.location.hash ) {
			return false;
		}

		const hash = window.location.hash.substring( 1 );
		if ( 'credentials' === hash ) {
			return true;
		}
		return false;
	}

	render() {
		const { credentials, rewindState, siteId, translate, siteSlug } = this.props;
		const classes = classNames(
			'jetpack-credentials',
			this.isSectionHighlighted() && 'is-highlighted'
		);
		const hasAuthorized = rewindState === 'provisioning' || rewindState === 'active';
		const hasCredentials = ! isEmpty( credentials );

		return (
			<div className={ classes }>
				<QuerySiteCredentials siteId={ siteId } />
				<SettingsSectionHeader title={ translate( 'Backups and security scans' ) }>
					{ hasAuthorized && (
						<Notice
							icon="checkmark"
							isCompact
							status="is-success"
							text={ translate( 'Connected' ) }
						/>
					) }
				</SettingsSectionHeader>
				{ hasCredentials ? (
					<CredentialsConfigured siteId={ siteId } />
				) : (
					<CompactCard>
						<RewindCredentialsForm
							{ ...{
								allowCancel: false,
								role: 'main',
								siteId,
							} }
						/>
					</CompactCard>
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

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		credentials: getJetpackCredentials( state, siteId, 'main' ),
	};
} )( localize( JetpackCredentials ) );
