import { useCallback, useEffect } from 'react';
import { A4A_PARTNER_DIRECTORY_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import PartnerDirectoryDashboardContent, {
	getProfileSavedMessage,
} from 'calypso/dashboard/agency/partner-directory/dashboard-content';
import { useDispatch, useSelector } from 'calypso/state';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice } from 'calypso/state/notices/actions';
import {
	PARTNER_DIRECTORY_AGENCY_DETAILS_SLUG,
	PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG,
} from '../constants';

import './style.scss';

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
		( response: unknown ) => {
			// The endpoint returns the full agency, so mirror it into the store.
			dispatch( setActiveAgency( { ...agency, ...( response as Agency ) } ) );
			dispatch( successNotice( getProfileSavedMessage(), { duration: 6000 } ) );
		},
		[ agency, dispatch ]
	);

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
			openSupportGuide={ showSupportGuide }
		/>
	);
};

export default PartnerDirectoryDashboard;
