/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { getSiteAdminUrl } from 'state/sites/selectors';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import getRewindState from 'state/selectors/get-rewind-state';
import {
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	PLAN_PERSONAL,
	PLAN_JETPACK_PERSONAL,
} from 'lib/plans/constants';

export const UnavailabilityNotice = ( {
	adminUrl,
	reason,
	rewindState,
	slug,
	translate,
	siteId,
	siteIsOnFreePlan,
} ) => {
	if ( rewindState !== 'unavailable' ) {
		return null;
	}

	switch ( reason ) {
		case 'host_not_supported':
			if ( siteIsOnFreePlan ) {
				return (
					<Banner
						callToAction={ translate( 'Upgrade' ) }
						dismissPreferenceName="activity-upgrade-banner-jetpack"
						event="activity_log_upgrade_click_jetpack"
						feature={ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY }
						plan={ PLAN_JETPACK_PERSONAL }
						title={ translate( 'Stay Safe' ) }
						description={ translate(
							'Protect your data with daily off-site backups, ' +
								'and keep a closer eye on your site with expanded activity logs.'
						) }
					/>
				);
			}
			return null;
		case 'missing_plan':
			return (
				<Banner
					plan={ PLAN_PERSONAL }
					href={ `/plans/${ slug }` }
					callToAction={ translate( 'Upgrade' ) }
					title={ translate(
						'Upgrade your Jetpack plan to restore your site to events in the past.'
					) }
				/>
			);
		case 'no_connected_jetpack':
			return (
				<Banner
					icon="history"
					href={ adminUrl }
					title={ translate( 'The site is not connected.' ) }
					description={ translate(
						"We can't back up or rewind your site until it has been reconnected."
					) }
				/>
			);

		case 'vp_can_transfer':
			return (
				<Banner
					icon="history"
					href={ `/start/rewind-switch/?siteId=${ siteId }&siteSlug=${ slug }` }
					title={ translate( 'Try our new backup service' ) }
					description={ translate(
						'Get real-time backups with one-click restores to any event in time.'
					) }
				/>
			);

		default:
			return null;
	}
};

const mapStateToProps = ( state, { siteId, siteIsOnFreePlan } ) => {
	const { reason, state: rewindState } = getRewindState( state, siteId );

	return {
		adminUrl: getSiteAdminUrl( state, siteId ),
		reason,
		rewindState,
		slug: getSelectedSiteSlug( state ),
		siteId,
		siteIsOnFreePlan,
	};
};

export default connect( mapStateToProps )( localize( UnavailabilityNotice ) );
