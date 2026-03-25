import { useCallback } from 'react';
import useSubmitLeadMatchingProfileMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-lead-matching-profile';
import {
	AgencyLeadMatchingProfile,
	AgencyLeadMatchingResponse,
	LeadMatchingDetails,
} from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import { mapLeadMatchingDetailsToProfile } from '../../utils/map-application-form-data';

type Props = {
	formData: LeadMatchingDetails;
	profile?: AgencyLeadMatchingProfile | null;
	onSubmitSuccess?: ( data: AgencyLeadMatchingResponse ) => void;
	onSubmitError?: () => void;
};

export default function useSubmitForm( {
	formData,
	profile,
	onSubmitSuccess,
	onSubmitError,
}: Props ) {
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
		submit( mapLeadMatchingDetailsToProfile( formData, profile ) );
	}, [ formData, profile, submit ] );

	return {
		onSubmit,
		isSubmitting,
	};
}
