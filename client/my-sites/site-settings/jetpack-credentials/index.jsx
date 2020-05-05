/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { some } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import CredentialsConfigured from './credentials-configured';
import Notice from 'components/notice';
import QueryRewindState from 'components/data/query-rewind-state';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import { getSelectedSiteId } from 'state/ui/selectors';
import getRewindState from 'state/selectors/get-rewind-state';
import { getSiteSlug } from 'state/sites/selectors';
import RewindCredentialsForm from 'components/rewind-credentials-form';

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
		const hasCredentials = some( credentials, { role: 'main' } );

		return (
			<div className={ classes }>
				<QueryRewindState siteId={ siteId } />
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
	const { credentials, state: rewindState } = getRewindState( state, siteId );

	return {
		credentials,
		rewindState,
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( JetpackCredentials ) );
