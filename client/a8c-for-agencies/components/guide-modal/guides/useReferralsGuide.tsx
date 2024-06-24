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
				title: translate( 'Welcome to product referral mode' ),
				description: translate(
					`Manage your clients' products without the burden of managing the billing. Assemble a cart of products, send a request for payment to your clients, and make commissions based on what you sell.`
				),
				preview: <img src={ step1 } alt="" />,
			},
			{
				title: translate( 'Add the products your client needs' ),
				description: translate(
					'Ensure "Refer products" is toggled on, and add any mix of products to your cart.'
				),
				preview: (
					<video
						src="https://automattic.com/wp-content/uploads/2024/05/referral-step-2.mp4"
						preload="auto"
						width={ 400 }
						poster={ step2 }
						muted
						autoPlay
					/>
				),
			},
			{
				title: translate( 'Review your selection during checkout' ),
				description: translate(
					`During checkout, add your client's email address and a note about the invoice for the selected products.`
				),
				preview: (
					<video
						src="https://automattic.com/wp-content/uploads/2024/05/referral-step-3.mp4"
						preload="auto"
						width={ 400 }
						muted
						poster={ step3 }
						autoPlay
					/>
				),
			},
			{
				title: translate( 'Send your client the payment request' ),
				description: translate(
					`Once sent, your client will get the invoice delivered to their inbox. After they pay, you'll be able to assign the products to their site.`
				),
				preview: (
					<video
						src="https://automattic.com/wp-content/uploads/2024/05/referral-step-4.mp4"
						preload="auto"
						width={ 400 }
						muted
						poster={ step4 }
						autoPlay
					/>
				),
			},
			{
				title: translate( 'Get paid real commissions' ),
				description: translate(
					`Clients will be billed at the end of every month for their products. When they pay, you'll make commissions on those products, which you'll be able to manage under the Referrals section, soon.`
				),
				preview: <img src={ step5 } alt="" />,
			},
		],
		[ translate ]
	);

	const guideModal = isModalOpen ? (
		<GuideModal steps={ steps } onClose={ () => setIsModalOpen( false ) } dismissable />
	) : null;

	return {
		openGuide: () => setIsModalOpen( true ),
		guideModal,
	};
}
export default useReferralsGuide;
