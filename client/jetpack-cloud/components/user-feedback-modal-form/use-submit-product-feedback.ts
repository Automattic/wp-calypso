import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { SubmitProductFeedbackParams } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { useDispatch } from 'calypso/state';
import useSubmitProductFeedbackMutation from 'calypso/state/jetpack-agency-dashboard/hooks/use-submit-product-feedback-mutation';
import { errorNotice } from 'calypso/state/notices/actions';

export default function useSubmitProductFeedback(): {
	isSubmittingFeedback: boolean;
	submitFeedback: ( params: SubmitProductFeedbackParams ) => void;
	isSubmissionSuccessful: boolean;
} {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const {
		isError,
		isSuccess,
		mutate,
		isPending: isSubmittingFeedback,
	} = useSubmitProductFeedbackMutation();

	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice( translate( 'Something went wrong. Please try again.' ), {
					id: 'submit-product-feedback-failure',
					duration: 5000,
				} )
			);
		}
	}, [ translate, isError, dispatch ] );

	return { isSubmittingFeedback, submitFeedback: mutate, isSubmissionSuccessful: isSuccess };
}
