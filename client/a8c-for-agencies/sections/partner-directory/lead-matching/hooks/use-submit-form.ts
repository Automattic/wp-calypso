import { useCallback } from 'react';
import useSubmitLeadMatchingProfileMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-lead-matching-profile';
import {
	AgencyLeadMatchingProfile,
	AgencyLeadMatchingResponse,
	LeadMatchingDetails,
} from 'calypso/a8c-for-agencies/sections/partner-directory/types';
import { mapLeadMatchingDetailsToProfile } from '../../utils/map-application-form-data';

export type SubmitSource = 'manual' | 'exit';

type SubmitContext = {
	payload: AgencyLeadMatchingProfile;
	source: SubmitSource;
};

type SubmitParams = {
	formData: LeadMatchingDetails;
	profile?: AgencyLeadMatchingProfile | null;
	acceptingWork?: boolean;
};

type Props = {
	onSubmitSuccess?: ( data: AgencyLeadMatchingResponse, context: SubmitContext ) => void;
	onSubmitError?: ( context: SubmitContext ) => void;
};

export default function useSubmitForm( { onSubmitSuccess, onSubmitError }: Props ) {
	const { mutateAsync: submit, isPending: isSubmitting } = useSubmitLeadMatchingProfileMutation();

	const onSubmit = useCallback(
		async ( {
			formData,
			profile,
			acceptingWork,
			source = 'manual',
		}: SubmitParams & { source?: SubmitSource } ) => {
			const payload = mapLeadMatchingDetailsToProfile( formData, profile );
			if ( typeof acceptingWork === 'boolean' ) {
				payload.availability.accepting_work = acceptingWork;
			}
			const context: SubmitContext = { payload, source };

			try {
				const data = await submit( payload );

				if ( data?.lead_matching_profile ) {
					onSubmitSuccess?.( data, context );
					return data;
				}
			} catch {
				onSubmitError?.( context );
				return undefined;
			}

			onSubmitError?.( context );
			return undefined;
		},
		[ onSubmitError, onSubmitSuccess, submit ]
	);

	return {
		onSubmit,
		isSubmitting,
	};
}
