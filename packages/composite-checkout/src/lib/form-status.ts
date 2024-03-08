import { useContext, useMemo } from 'react';
import { FormStatus, FormStatusController } from '../types';
import { FormStatusContext } from './form-status-context';

export function useFormStatus(): FormStatusController {
	const { formStatus, setFormStatus } = useContext( FormStatusContext );
	const formStatusActions = useMemo(
		() => ( {
			setFormLoading: () => setFormStatus( FormStatus.LOADING ),
			setFormReady: () => setFormStatus( FormStatus.READY ),
			setFormSubmitting: () => setFormStatus( FormStatus.SUBMITTING ),
			setFormValidating: () => setFormStatus( FormStatus.VALIDATING ),
		} ),
		[ setFormStatus ]
	);
	return useMemo(
		() => ( {
			...formStatusActions,
			formStatus,
		} ),
		[ formStatus, formStatusActions ]
	);
}
