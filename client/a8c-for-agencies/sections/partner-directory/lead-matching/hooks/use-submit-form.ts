import { useCallback } from 'react';
import useSubmitLeadMatchingProfileMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-lead-matching-profile';
import {
	AgencyLeadMatchingResponse,
	LeadMatchingDetails,
} from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import { useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { mapLeadMatchingDetailsToProfile } from '../../utils/map-application-form-data';

type Props = {
	formData: LeadMatchingDetails;
	onSubmitSuccess?: ( data: AgencyLeadMatchingResponse ) => void;
	onSubmitError?: () => void;
};

export default function useSubmitForm( { formData, onSubmitSuccess, onSubmitError }: Props ) {
	const agency = useSelector( getActiveAgency );
	const { mutate: submit, isPending: isSubmitting } = useSubmitLeadMatchingProfileMutation( {
		onSuccess: ( data ) => {
			if ( onSubmitSuccess && data?.lead_matching_profile ) {
				onSubmitSuccess( data );
			} else {
				onSubmitError?.();
			}
		},
		onError: () => {
			onSubmitError?.();
		},
	} );

	const onSubmit = useCallback( () => {
		submit( mapLeadMatchingDetailsToProfile( formData, agency?.lead_matching?.profile ) );
	}, [ agency?.lead_matching?.profile, formData, submit ] );

	return {
		onSubmit,
		isSubmitting,
	};
}
