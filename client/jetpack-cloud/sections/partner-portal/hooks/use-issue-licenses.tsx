import { useSelector } from 'calypso/state';
import useIssueLicenseMutation from 'calypso/state/partner-portal/licenses/hooks/use-issue-license-mutation';
import { doesPartnerRequireAPaymentMethod } from 'calypso/state/partner-portal/partner/selectors';
import { APIError, APILicense } from 'calypso/state/partner-portal/types';

const NO_OP = () => {
	/* Do nothing */
};

export type IssueLicenseRequest = {
	slug: string;
	quantity: number;
};

export type FulfilledIssueLicenseResult = APILicense & {
	status: 'fulfilled';
	slug: string;
};
export type RejectedIssueLicenseResult = {
	status: 'rejected';
	slug: string;
};

export type IssueLicenseResult = FulfilledIssueLicenseResult | RejectedIssueLicenseResult;

type UseIssueLicensesOptions = {
	onError?: ( ( error: APIError ) => void ) | ( () => void );
};
const useIssueLicenses = ( options: UseIssueLicensesOptions = {} ) => {
	const paymentMethodRequired = useSelector( doesPartnerRequireAPaymentMethod );

	const { mutateAsync, isIdle } = useIssueLicenseMutation( {
		onError: options.onError ?? NO_OP,
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

	const issueLicenses = (
		selectedLicenses: IssueLicenseRequest[]
	): Promise< IssueLicenseResult[] > => {
		const requests: Promise< IssueLicenseResult >[] = selectedLicenses.map(
			( { slug, quantity } ) =>
				mutateAsync( { product: slug, quantity } )
					.then(
						( value ): FulfilledIssueLicenseResult => ( { slug, status: 'fulfilled', ...value } )
					)
					.catch( (): RejectedIssueLicenseResult => ( { slug, status: 'rejected' } ) )
		);

		return Promise.all( requests );
	};

	return {
		isReady: isIdle,
		issueLicenses,
	};
};

export default useIssueLicenses;
