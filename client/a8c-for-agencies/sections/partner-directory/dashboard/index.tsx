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

const PartnerDirectoryDashboard = () => {
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	const agency = useSelector( getActiveAgency );

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	const onPublishSuccess = useCallback(
		( response: AgencyPayload ) => {
			// The endpoint returns the full agency; the cast bridges the api-core
			// and Redux models of it.
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

	return (
		<PartnerDirectoryDashboardContent
			agency={ agency }
			recordTracksEvent={ recordTracks }
			expertiseUrl={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }` }
			profileUrl={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG }` }
			onPublishSuccess={ onPublishSuccess }
			onPublishError={ onPublishError }
			openSupportGuide={ showSupportGuide }
		/>
	);
};

export default PartnerDirectoryDashboard;
