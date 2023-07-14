import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import useIssueLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { APIError } from 'calypso/state/partner-portal/types';

const useIssueLicenses = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );

	const { mutateAsync, isIdle } = useIssueLicenseMutation( {
		onError: ( error: APIError ) => {
			if ( error.code === 'missing_valid_payment_method' ) {
				dispatch(
					errorNotice(
						translate(
							'A primary payment method is required.{{br/}} {{a}}Try adding a new payment method{{/a}} or contact support.',
							{
								components: {
									a: (
										<a href="/partner-portal/payment-methods/add?return=/partner-portal/issue-license" />
									),
									br: <br />,
								},
							}
						)
					)
				);

				return;
			}

			dispatch( errorNotice( error.message ) );
		},
		retry: ( errorCount, error ) => {
			// There's a slight delay before the license creation API is made
			// aware when a user adds a payment method and will allow creation
			// of a license.
			// To make this a smoother experience, we silently retry a couple of
			// times if the error is missing_valid_payment_method but the
			// local state shows that a payment method exists.
			if ( ! paymentMethodRequired && error?.code === 'missing_valid_payment_method' ) {
				return errorCount < 5;
			}

			return false;
		},
	} );

	return useMemo( () => {
		const issueLicenses = ( productSlugs: string[] ) => {
			const requests = productSlugs.map( ( slug ) => mutateAsync( { product: slug } ) );
			return Promise.allSettled( requests );
		};

		return {
			isReady: isIdle,
			issueLicenses,
		};
	}, [ mutateAsync, isIdle ] );
};

export default useIssueLicenses;
