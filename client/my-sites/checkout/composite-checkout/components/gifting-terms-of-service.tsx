import { translate } from 'i18n-calypso';
import CheckoutTermsItem from 'calypso/my-sites/checkout/composite-checkout/components/checkout-terms-item';

export const GiftingTermsOfService = () => {
	const giftingTermsOfServiceText = translate(
		`Gifting ipsum dolor sit amet, consectetur adipiscing elit. Morbi at consectetur dolor.`
	);
	return <CheckoutTermsItem>{ giftingTermsOfServiceText }</CheckoutTermsItem>;
};
