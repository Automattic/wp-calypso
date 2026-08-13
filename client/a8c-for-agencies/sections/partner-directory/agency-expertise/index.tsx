import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect } from 'react';
import Form from 'calypso/a8c-for-agencies/components/form';
import {
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PartnerDirectoryExpertiseContent, {
	getApplicationSubmitFailedMessage,
	getApplicationSubmittedMessage,
} from 'calypso/dashboard/agency/partner-directory/expertise/expertise-content';
import { useDispatch, useSelector } from 'calypso/state';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { PARTNER_DIRECTORY_DASHBOARD_SLUG } from '../constants';
import type { Agency as AgencyPayload } from '@automattic/api-core';

const AgencyExpertise = () => {
	const dispatch = useDispatch();

	const agency = useSelector( getActiveAgency );

	const recordTracks = useCallback(
		( eventName: string, properties?: Record< string, unknown > ) => {
			dispatch( recordTracksEvent( eventName, properties ) );
		},
		[ dispatch ]
	);

	const onSubmitSuccess = useCallback(
		( response: AgencyPayload ) => {
			// The shared mutation only refreshes the dashboard's query cache,
			// which this app doesn't read, so mirror the updated agency into
			// Redux here. The cast bridges the api-core and Redux models of it.
			dispatch( setActiveAgency( { ...agency, ...response } as Agency ) );
			dispatch(
				successNotice( getApplicationSubmittedMessage(), {
					displayOnNextPage: true,
					duration: 6000,
				} )
			);
			page( A4A_PARTNER_DIRECTORY_DASHBOARD_LINK );
		},
		[ agency, dispatch ]
	);

	const onSubmitError = useCallback( () => {
		dispatch( errorNotice( getApplicationSubmitFailedMessage(), { duration: 6000 } ) );
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
		<Form
			className="partner-directory-agency-expertise"
			title={ __( 'Share your expertise' ) }
			description={ __( 'Pick your agency’s specialties and choose your directories.' ) }
			autocomplete="off"
		>
			<PartnerDirectoryExpertiseContent
				agency={ agency }
				recordTracksEvent={ recordTracks }
				dashboardUrl={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_DASHBOARD_SLUG }` }
				onSubmitSuccess={ onSubmitSuccess }
				onSubmitError={ onSubmitError }
				shouldUseRouterLink={ false }
			/>
		</Form>
	);
};

export default AgencyExpertise;
