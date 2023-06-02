import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import Banner from 'calypso/components/banner';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import { getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export const RewindUnavailabilityNotice = ( {
	adminUrl,
	reason,
	rewindState,
	slug,
	translate,
	siteId,
} ) => {
	if ( rewindState !== 'unavailable' ) {
		return null;
	}

	switch ( reason ) {
		case 'no_connected_jetpack':
			return (
				<Banner
					icon="history"
					href={ adminUrl }
					title={ translate( 'The site is not connected.' ) }
					description={ translate(
						"We can't back up or restore your site until it has been reconnected."
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

const mapStateToProps = ( state, { siteId } ) => {
	const { reason, state: rewindState } = getRewindState( state, siteId );

	return {
		adminUrl: getSiteAdminUrl( state, siteId ),
		reason,
		rewindState,
		slug: getSelectedSiteSlug( state ),
		siteId,
	};
};

export default connect( mapStateToProps )( localize( RewindUnavailabilityNotice ) );
