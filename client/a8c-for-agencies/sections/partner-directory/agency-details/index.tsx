import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
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
	getDetailsDescription,
	getLogoUploadFailedMessage,
	getProfileSavedMessage,
	getProfileSaveFailedMessage,
} from 'calypso/dashboard/agency/partner-directory/details/details-content';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG } from '../constants';
import usePartnerDirectoryHost from '../hooks/use-partner-directory-host';
import type { Agency as AgencyPayload } from '@automattic/api-core';
import type { DetailsSubmitFailure } from 'calypso/dashboard/agency/partner-directory/details/details-content';

const AgencyDetailsForm = () => {
	const dispatch = useDispatch();
	const { showSupportGuide } = useHelpCenter();
	const { agency, recordTracks, mergeActiveAgency } = usePartnerDirectoryHost();

	const { isFeedbackShown } = useShowFeedback( FeedbackType.PDDetailsAdded );

	const onSubmitSuccess = ( response: AgencyPayload ) => {
		mergeActiveAgency( response );
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
	};

	const onSubmitError = ( failure: DetailsSubmitFailure ) => {
		dispatch(
			errorNotice(
				failure === 'logo-upload' ? getLogoUploadFailedMessage() : getProfileSaveFailedMessage(),
				{ duration: 6000 }
			)
		);
	};

	// The section controller waits for the agency before rendering sections,
	// so this only satisfies the shared component's required prop.
	if ( ! agency ) {
		return null;
	}

	return (
		<Form
			className="partner-directory-agency-details"
			title={ __( 'Finish adding details to your public profile' ) }
			description={ getDetailsDescription(
				<Button
					variant="link"
					href={ `${ A4A_PARTNER_DIRECTORY_LINK }/${ PARTNER_DIRECTORY_AGENCY_EXPERTISE_SLUG }` }
					children={ null }
				/>
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
