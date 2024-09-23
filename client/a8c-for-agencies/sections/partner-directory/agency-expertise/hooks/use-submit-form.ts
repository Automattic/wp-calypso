import { useCallback } from 'react';
import useSubmitPartnerDirectoryApplicationMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-partner-directory-application';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyDirectoryApplication } from '../../types';

type Props = {
	formData: AgencyDirectoryApplication | null;
	onSubmitSuccess?: ( data: Agency ) => void;
	onSubmitError?: () => void;
};

export default function useSubmitForm( { formData, onSubmitSuccess, onSubmitError }: Props ) {
	const { mutate: submit, isPending: isSubmitting } = useSubmitPartnerDirectoryApplicationMutation(
		{
			onSuccess: ( data ) => {
				if ( onSubmitSuccess && data?.profile.partner_directory_application?.status ) {
					onSubmitSuccess( data );
				} else {
					onSubmitError?.();
				}
			},
			onError: () => {
				onSubmitError?.();
			},
		}
	);

	const onSubmit = useCallback( () => {
		formData && submit( formData );
	}, [ formData, submit ] );

	return {
		onSubmit,
		isSubmitting,
	};
}
