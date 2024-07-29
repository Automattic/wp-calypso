import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { SubmitContactSupportParams } from 'calypso/a8c-for-agencies/data/support/types';
import useSubmitSupportFormMutation from 'calypso/a8c-for-agencies/data/support/use-submit-support-form-mutation';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';

type Output = {
	isSubmitting: boolean;
	submit: ( params: SubmitContactSupportParams ) => void;
	isSubmissionSuccessful: boolean;
};

export default function useSubmitContactSupport(): Output {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { isError, isSuccess, mutate, isPending } = useSubmitSupportFormMutation();

	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice( translate( 'Something went wrong. Please try again.' ), {
					id: 'submit-contact-support-failure',
					duration: 5000,
				} )
			);
		}
	}, [ translate, isError, dispatch ] );

	return {
		isSubmitting: isPending,
		submit: mutate,
		isSubmissionSuccessful: isSuccess,
	};
}
