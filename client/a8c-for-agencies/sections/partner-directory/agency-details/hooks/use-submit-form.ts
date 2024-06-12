import { useCallback, useState } from 'react';
import { AgencyDetails } from '../../types';

type Props = {
	formData: AgencyDetails;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function useSubmitForm( { formData }: Props ) {
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const onSubmit = useCallback( () => {
		setIsSubmitting( true );
		// FIXME: Submit the  data to the backend
	}, [ formData ] );

	return {
		onSubmit,
		isSubmitting,
	};
}
