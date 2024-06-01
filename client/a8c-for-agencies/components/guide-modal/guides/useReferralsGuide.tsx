import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import GuideModal from '..';

function useReferralsGuide() {
	const translate = useTranslate();
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const steps = useMemo(
		() => [
			{
				title: translate( 'Welcome to Refer products mode' ),
				description: translate(
					'Check out the quick steps you’ll take to refer products to your client so that you get paid commissions.'
				),
			},
			{
				title: translate( 'Add the needed products for your client' ),
				description: translate(
					'Just add the products to the cart like you would in any other e-commerce page.'
				),
			},
			{
				title: translate( 'Proceed to checkout as normal' ),
				description: translate(
					'All done? Just click Checkout to fill in the details for your client.'
				),
			},
			{
				title: translate( 'Send a payment to your client with a note' ),
				description: translate(
					'At checkout, instead of paying yourself, send a payment request to your client with a note.'
				),
			},
			{
				title: translate( 'Get paid commissions' ),
				description: translate(
					'Your client will pay for the subscriptions. You will get commissions when they pay each month. You’ll have access to the licenses so that you can configure the products and hosting for your client.'
				),
			},
		],
		[ translate ]
	);

	const guideModal = isModalOpen ? (
		<GuideModal steps={ steps } onClose={ () => setIsModalOpen( false ) } />
	) : null;

	return {
		openGuide: () => setIsModalOpen( true ),
		guideModal,
	};
}
export default useReferralsGuide;
