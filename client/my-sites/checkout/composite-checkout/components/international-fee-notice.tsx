import { localizeUrl } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/composite-checkout/components/checkout-terms-item';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

export const InternationalFeeNotice = () => {
	const contactInfo: ManagedContactDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' ).getContactInfo()
	);

	if ( contactInfo.countryCode?.value !== 'US' ) {
		const internationalFeeAgreement = translate(
			`The selected country and postal code may be processed as an international transaction, you agree to pay any associated fees. {{link}}Learn more{{/link}}`,
			{
				components: {
					link: (
						<a
							href={ localizeUrl( 'https://wordpress.com/tos/' ) }
							target="_blank"
							rel="noopener noreferrer"
						/>
					),
				},
			}
		);
		return <CheckoutTermsItem>{ internationalFeeAgreement }</CheckoutTermsItem>;
	}

	return null;
};
