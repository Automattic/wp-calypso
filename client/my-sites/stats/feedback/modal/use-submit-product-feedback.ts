import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import useSubmitProductFeedbackMutation from './use-submit-product-feedback-mutation';

export interface SubmitJetpackStatsFeedbackParams {
	source_url: string;
	product_name: string;
	feedback: string;
}

export default function useSubmitProductFeedback( siteId: number ): {
	isSubmittingFeedback: boolean;
	submitFeedback: ( params: SubmitJetpackStatsFeedbackParams ) => void;
	isSubmissionSuccessful: boolean;
	resetMutation: () => void;
} {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const {
		isError,
		isSuccess,
		mutate,
		isPending: isSubmittingFeedback,
		reset,
	} = useSubmitProductFeedbackMutation( siteId );

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

	return {
		isSubmittingFeedback,
		submitFeedback: mutate,
		isSubmissionSuccessful: isSuccess,
		resetMutation: reset,
	};
}
