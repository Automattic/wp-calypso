import { useCallback } from 'react';
import useSubmitAgencyDetailsMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-agency-details';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyDetails } from '../../types';

type Props = {
	formData: AgencyDetails;
	onSubmitSuccess?: ( data: Agency ) => void;
	onSubmitError?: () => void;
};

export default function useSubmitForm( { formData, onSubmitSuccess, onSubmitError }: Props ) {
	const { mutate: submit, isPending: isSubmitting } = useSubmitAgencyDetailsMutation( {
		onSuccess: ( data ) => {
			if ( onSubmitSuccess && data?.profile ) {
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
		submit( formData );
	}, [ formData, submit ] );

	return {
		onSubmit,
		isSubmitting,
	};
}
