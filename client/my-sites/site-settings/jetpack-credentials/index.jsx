import { CompactCard } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';
import Notice from 'calypso/components/notice';
import RewindCredentialsForm from 'calypso/components/rewind-credentials-form';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CredentialsConfigured from './credentials-configured';

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
		const classes = clsx( 'jetpack-credentials', this.isSectionHighlighted() && 'is-highlighted' );
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
