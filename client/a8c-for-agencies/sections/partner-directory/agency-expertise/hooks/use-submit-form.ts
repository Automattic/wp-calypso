import { useCallback, useState } from 'react';
import { AgencyDirectoryApplication } from '../../types';

type Props = {
	formData: AgencyDirectoryApplication;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function useSubmitForm( { formData }: Props ) {
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const onSubmit = useCallback( () => {
		setIsSubmitting( true );
		// FIXME: Submit the  data to the backend
	}, [] );

	return {
		onSubmit,
		isSubmitting,
	};
}
