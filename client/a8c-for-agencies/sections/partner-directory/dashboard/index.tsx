import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import PartnerDirectoryDashboardContent, {
	getProfilePublishFailedMessage,
	getProfilePublishedMessage,
} from 'calypso/dashboard/agency/partner-directory/dashboard-content';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
} from '../constants';
import usePartnerDirectoryHost from '../hooks/use-partner-directory-host';
import type { Agency as AgencyPayload } from '@automattic/api-core';

/*
 * The shared component fires the dashboard's calypso_a4a_* event names.
 * Keep the pre-migration names in this app so existing Tracks reports keep
 * receiving data.
 * TODO: Remove the rewrite when this screen is retired.
 */
const toLegacyEventName = ( eventName: string ) =>
	eventName.replace(
		'calypso_a4a_partner_directory_dashboard_',
		'calypso_partner_directory_dashboard_'
	);

const PartnerDirectoryDashboard = () => {
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();
	const { agency, recordTracks, mergeActiveAgency } = usePartnerDirectoryHost();

	const recordLegacyTracks = ( eventName: string, properties?: Record< string, unknown > ) =>
		recordTracks( toLegacyEventName( eventName ), properties );

	const onPublishSuccess = ( response: AgencyPayload ) => {
		mergeActiveAgency( response );
		dispatch( successNotice( getProfilePublishedMessage(), { duration: 6000 } ) );
	};

	const onPublishError = () => {
		dispatch( errorNotice( getProfilePublishFailedMessage(), { duration: 6000 } ) );
	};

	// The section controller waits for the agency before rendering sections,
	// so this only satisfies the shared component's required prop.
	if ( ! agency ) {
		return null;
	}

	return (
		<PartnerDirectoryDashboardContent
			agency={ agency }
			recordTracksEvent={ recordLegacyTracks }
			expertiseUrl={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }` }
			profileUrl={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }` }
			onPublishSuccess={ onPublishSuccess }
			onPublishError={ onPublishError }
			openSupportGuide={ showSupportGuide }
			shouldUseRouterLink={ false }
		/>
	);
};

export default PartnerDirectoryDashboard;
