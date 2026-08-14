import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useCallback, useEffect } from 'react';
import useShowFeedback from 'calypso/a8c-for-agencies/components/a4a-feedback/hooks/use-show-a4a-feedback';
import { FeedbackType } from 'calypso/a8c-for-agencies/components/a4a-feedback/types';
import Form from 'calypso/a8c-for-agencies/components/form';
import {
	A4A_FEEDBACK_LINK,
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import PartnerDirectoryDetailsContent, {
	getProfileSavedMessage,
	getProfileSaveFailedMessage,
} from 'calypso/dashboard/agency/partner-directory/details/details-content';
import { useDispatch, useSelector } from 'calypso/state';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG } from '../constants';
import type { Agency as AgencyPayload } from '@automattic/api-core';

const AgencyDetailsForm = () => {
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();

	const agency = useSelector( getActiveAgency );

	const { isFeedbackShown } = useShowFeedback( FeedbackType.PDDetailsAdded );

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
				successNotice( getProfileSavedMessage(), {
					displayOnNextPage: true,
					duration: 6000,
				} )
			);

			if ( isFeedbackShown ) {
				page( A4A_PARTNER_DIRECTORY_DASHBOARD_LINK );
			} else {
				page( addQueryArgs( A4A_FEEDBACK_LINK, { type: FeedbackType.PDDetailsAdded } ) );
			}
		},
		[ agency, isFeedbackShown, dispatch ]
	);

	const onSubmitError = useCallback( () => {
		dispatch( errorNotice( getProfileSaveFailedMessage(), { duration: 6000 } ) );
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
			className="partner-directory-agency-details"
			title={ __( 'Finish adding details to your public profile' ) }
			description={ createInterpolateElement(
				__(
					'Add details to your agency’s public profile for clients to see. <a>Want to update your expertise instead?</a>'
				),
				{
					a: (
						<Button
							variant="link"
							href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }` }
							children={ null }
						/>
					),
				}
			) }
			autocomplete="off"
		>
			<PartnerDirectoryDetailsContent
				agency={ agency }
				recordTracksEvent={ recordTracks }
				onSubmitSuccess={ onSubmitSuccess }
				onSubmitError={ onSubmitError }
				openSupportGuide={ showSupportGuide }
			/>
		</Form>
	);
};

export default AgencyDetailsForm;
