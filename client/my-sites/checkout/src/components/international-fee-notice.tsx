import { translate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

export const showInternationalFeeNotice = ( contactInfo: ManagedContactDetails ) => {
	if ( contactInfo.countryCode?.value !== 'US' ) {
		return true;
	}
};
export const InternationalFeeNotice = () => {
	const internationalFeeAgreement = translate(
		`Your issuing bank may choose to charge an international transaction fee or a currency exchange fee. Your bank may be able to provide more information as to when this is necessary.`
	);
	return <CheckoutTermsItem>{ internationalFeeAgreement }</CheckoutTermsItem>;
};
