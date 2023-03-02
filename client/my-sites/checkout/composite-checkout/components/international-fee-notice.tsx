import { useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/composite-checkout/components/checkout-terms-item';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

export const InternationalFeeNotice = () => {
	const contactInfo: ManagedContactDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' )?.getContactInfo()
	);

	if ( contactInfo?.countryCode?.value !== 'US' ) {
		const internationalFeeAgreement = translate(
			`Your issuing bank may choose to charge an international transaction fee or a currency exchange fee. Your bank may be able to provide more information as to when this is necessary.`
		);
		return <CheckoutTermsItem>{ internationalFeeAgreement }</CheckoutTermsItem>;
	}

	return null;
};
