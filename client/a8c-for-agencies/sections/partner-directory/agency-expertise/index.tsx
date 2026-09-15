import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import Form from 'calypso/a8c-for-agencies/components/form';
import {
	A4A_PARTNER_DIRECTORY_DASHBOARD_LINK,
	A4A_PARTNER_DIRECTORY_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import PartnerDirectoryExpertiseContent, {
	getApplicationSubmitFailedMessage,
	getApplicationSubmittedMessage,
} from 'calypso/dashboard/agency/partner-directory/expertise/expertise-content';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { PARTNER_DIRECTORY_DASHBOARD_SLUG } from '../constants';
import usePartnerDirectoryHost from '../hooks/use-partner-directory-host';
import type { Agency as AgencyPayload } from '@automattic/api-core';

const AgencyExpertise = () => {
	const dispatch = useDispatch();
	const { agency, recordTracks, mergeActiveAgency } = usePartnerDirectoryHost();

	const onSubmitSuccess = ( response: AgencyPayload ) => {
		mergeActiveAgency( response );
		dispatch(
			successNotice( getApplicationSubmittedMessage(), {
				displayOnNextPage: true,
				duration: 6000,
			} )
		);
		page( A4A_PARTNER_DIRECTORY_DASHBOARD_LINK );
	};

	const onSubmitError = () => {
		dispatch( errorNotice( getApplicationSubmitFailedMessage(), { duration: 6000 } ) );
	};

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
