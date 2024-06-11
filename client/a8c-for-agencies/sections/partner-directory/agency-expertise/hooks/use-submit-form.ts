import { useCallback } from 'react';
import useSubmitPartnerDirectoryApplicationMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-partner-directory-application';
import { AgencyDirectoryApplication } from '../../types';

type Props = {
	formData: AgencyDirectoryApplication;
};

export default function useSubmitForm( { formData }: Props ) {
	const { mutate: submit, isPending: isSubmitting } =
		useSubmitPartnerDirectoryApplicationMutation();

	const onSubmit = useCallback( () => {
		submit( {
			services: formData.services,
			products: formData.products,
			directories: formData.directories,
			feedback_url: formData.feedbackUrl,
		} );
	}, [ formData.directories, formData.feedbackUrl, formData.products, formData.services, submit ] );

	return {
		onSubmit,
		isSubmitting,
	};
}
