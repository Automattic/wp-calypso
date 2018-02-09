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
import { getRewindState } from 'state/selectors';

export const UnavailabilityNotice = ( { adminUrl, reason, rewindState, slug, translate } ) => {
	if ( rewindState !== 'unavailable' ) {
		return null;
	}

	switch ( reason ) {
		case 'no_connected_jetpack':
			return (
				<Banner
					icon="history"
					href={ adminUrl }
					title={ translate( 'The site is not connected' ) }
					description={ translate(
						"We can't back up or rewind your site until it has been reconnected."
					) }
				/>
			);

		case 'vp_can_transfer':
			return (
				<Banner
					icon="history"
					href={ `/settings/security/${ slug }` }
					title={ translate( 'VaultPress is running' ) }
					description={ translate(
						'We are unable to create backups and Rewind while VaultPress is running.'
					) }
				/>
			);
	}
};

const mapStateToProps = ( state, { siteId } ) => {
	const { reason, state: rewindState } = getRewindState( state, siteId );

	return {
		adminUrl: getSiteAdminUrl( state, siteId ),
		reason,
		rewindState,
		slug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( localize( UnavailabilityNotice ) );
