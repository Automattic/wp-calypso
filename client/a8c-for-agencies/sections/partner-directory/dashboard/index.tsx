import { useCallback, useEffect } from 'react';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import PartnerDirectoryDashboardContent, {
	getProfilePublishFailedMessage,
	getProfilePublishedMessage,
} from 'calypso/dashboard/agency/partner-directory/dashboard-content';
import { useDispatch, useSelector } from 'calypso/state';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
} from '../constants';
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

	const agency = useSelector( getActiveAgency );

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( toLegacyEventName( eventName ), properties ) );
		},
		[ dispatch ]
	);

	const onPublishSuccess = useCallback(
		( response: AgencyPayload ) => {
			// The shared mutation only refreshes the dashboard's query cache,
			// which this app doesn't read, so mirror the updated agency into
			// Redux here. The cast bridges the api-core and Redux models of it.
			dispatch( setActiveAgency( { ...agency, ...response } as Agency ) );
			dispatch( successNotice( getProfilePublishedMessage(), { duration: 6000 } ) );
		},
		[ agency, dispatch ]
	);

	const onPublishError = useCallback( () => {
		dispatch( errorNotice( getProfilePublishFailedMessage(), { duration: 6000 } ) );
	}, [ dispatch ] );

	// We want to scroll to the top of the page when the component is rendered
	useEffect( () => {
		document.querySelector( '.partner-directory__body' )?.scrollTo( 0, 0 );
	}, [] );

	// The section controller waits for the agency before rendering sections,
	// so this only satisfies the shared component's required prop.
	if ( ! agency ) {
		return null;
	}

	return (
		<PartnerDirectoryDashboardContent
			agency={ agency }
			recordTracksEvent={ recordTracks }
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
