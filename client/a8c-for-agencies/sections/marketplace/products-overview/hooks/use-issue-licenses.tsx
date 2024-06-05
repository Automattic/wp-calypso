import usePaymentMethod from 'calypso/a8c-for-agencies/sections/purchases/payment-methods/hooks/use-payment-method';
import {
	APIError,
	APILicense,
	APIProductFamilyProductBundlePrice,
} from 'calypso/state/partner-portal/types';
import useIssueLicenseMutation from '../../hooks/use-issue-license-mutation';

const NO_OP = () => {
	/* Do nothing */
};

export type IssueLicenseRequest = {
	slug: string;
	quantity: number;
	supported_bundles?: APIProductFamilyProductBundlePrice[];
};

export type FulfilledIssueLicenseResult = {
	status: 'fulfilled';
	slug: string;
	licenses: APILicense[];
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
	const { paymentMethodRequired } = usePaymentMethod();

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
			( { slug, quantity, supported_bundles = [] } ) => {
				const isBundle = supported_bundles.some( ( bundle ) => bundle.quantity === quantity );
				return mutateAsync( { product: slug, quantity, isBundle } )
					.then( ( value ): FulfilledIssueLicenseResult => {
						return { slug, status: 'fulfilled', licenses: value };
					} )
					.catch( (): RejectedIssueLicenseResult => ( { slug, status: 'rejected' } ) );
			}
		);

		return Promise.all( requests );
	};

	return {
		isReady: isIdle,
		issueLicenses,
	};
};

export default useIssueLicenses;
