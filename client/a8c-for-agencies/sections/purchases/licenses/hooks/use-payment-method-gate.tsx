import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { addQueryArgs } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import usePaymentMethod from '../../payment-methods/hooks/use-payment-method';

/**
 * Guards license actions that cost money. Returns a predicate that reports
 * whether the action can't proceed, having told the agency why and where to
 * come back to. Client licenses are billed to the client, so they skip it.
 */
export default function usePaymentMethodGate( isClientLicense?: boolean ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { paymentMethodRequired } = usePaymentMethod();

	return useCallback(
		( returnUrl: string ) => {
			if ( ! paymentMethodRequired || isClientLicense ) {
				return false;
			}

			const noticeLinkHref = addQueryArgs(
				{
					return: returnUrl,
				},
				'/purchases/payment-methods/add'
			);
			const errorMessage = translate(
				'A primary payment method is required.{{br/}} ' +
					'{{a}}Try adding a new payment method{{/a}} or contact support.',
				{
					components: {
						a: <a href={ noticeLinkHref } />,
						br: <br />,
					},
				}
			);

			dispatch( errorNotice( errorMessage ) );
			return true;
		},
		[ dispatch, isClientLicense, paymentMethodRequired, translate ]
	);
}
