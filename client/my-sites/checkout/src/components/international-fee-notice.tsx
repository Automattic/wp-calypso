import { useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/src/components/checkout-terms-item';
import { CHECKOUT_STORE } from '../lib/wpcom-store';

export const InternationalFeeNotice = () => {
	const contactInfo = useSelect( ( select ) => select( CHECKOUT_STORE ).getContactInfo(), [] );

	if ( contactInfo.countryCode?.value !== 'US' ) {
		const internationalFeeAgreement = translate(
			`Your issuing bank may choose to charge an international transaction fee or a currency exchange fee. Your bank may be able to provide more information as to when this is necessary.`
		);
		return <CheckoutTermsItem>{ internationalFeeAgreement }</CheckoutTermsItem>;
	}

	return null;
};
