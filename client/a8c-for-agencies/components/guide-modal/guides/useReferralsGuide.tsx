import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import step1 from 'calypso/assets/images/a8c-for-agencies/referral-step-1.jpg';
import step2 from 'calypso/assets/images/a8c-for-agencies/referral-step-2.jpg';
import step3 from 'calypso/assets/images/a8c-for-agencies/referral-step-3.jpg';
import step4 from 'calypso/assets/images/a8c-for-agencies/referral-step-4.jpg';
import step5 from 'calypso/assets/images/a8c-for-agencies/referral-step-5.jpg';
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
				preview: <img src={ step1 } alt="" />,
			},
			{
				title: translate( 'Add the needed products for your client' ),
				description: translate(
					'Just add the products to the cart like you would in any other e-commerce page.'
				),
				preview: (
					<video
						src="https://automattic.com/wp-content/uploads/2024/05/referral-step-2.mp4"
						preload="auto"
						width={ 400 }
						poster={ step2 }
						muted
						autoPlay
						loop
					/>
				),
			},
			{
				title: translate( 'Proceed to checkout as normal' ),
				description: translate(
					'All done? Just click Checkout to fill in the details for your client.'
				),
				preview: (
					<video
						src="https://automattic.com/wp-content/uploads/2024/05/referral-step-3.mp4"
						preload="auto"
						width={ 400 }
						muted
						poster={ step3 }
						autoPlay
						loop
					/>
				),
			},
			{
				title: translate( 'Send a payment to your client with a note' ),
				description: translate(
					'At checkout, instead of paying yourself, send a payment request to your client with a note.'
				),
				preview: (
					<video
						src="https://automattic.com/wp-content/uploads/2024/05/referral-step-4.mp4"
						preload="auto"
						width={ 400 }
						muted
						poster={ step4 }
						autoPlay
						loop
					/>
				),
			},
			{
				title: translate( 'Get paid commissions' ),
				description: translate(
					'Your client will pay for the subscriptions. You will get commissions when they pay each month. You’ll have access to the licenses so that you can configure the products and hosting for your client.'
				),
				preview: <img src={ step5 } alt="" />,
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
