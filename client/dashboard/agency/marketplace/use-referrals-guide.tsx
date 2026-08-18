import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Guide,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useState } from 'react';
import step1 from 'calypso/assets/images/a8c-for-agencies/referral-step-1.jpg';
import step2 from 'calypso/assets/images/a8c-for-agencies/referral-step-2.jpg';
import step3 from 'calypso/assets/images/a8c-for-agencies/referral-step-3.jpg';
import step4 from 'calypso/assets/images/a8c-for-agencies/referral-step-4.jpg';
import step5 from 'calypso/assets/images/a8c-for-agencies/referral-step-5.jpg';

import './referrals-guide.scss';

type ReferralsGuideStep = {
	title: string;
	description: string;
	preview: React.ReactNode;
};

// TODO: the step images and videos still show the classic A4A dashboard — replace
// them with captures of the new MSD screens once the marketplace flows land there.
const getSteps = (): ReferralsGuideStep[] => [
	{
		title: __( 'Welcome to product referral mode' ),
		description: __(
			'Manage your clients’ products without the burden of managing the billing. Assemble a cart of products, send a request for payment to your clients, and make commissions based on what you sell.'
		),
		preview: <img src={ step1 } alt="" />,
	},
	{
		title: __( 'Add the products your client needs' ),
		description: __(
			'Ensure “Refer products” is toggled on, and add any mix of products to your cart.'
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
		title: __( 'Review your selection during checkout' ),
		description: __(
			'During checkout, add your client’s email address and a note about the invoice for the selected products.'
		),
		preview: (
			<video
				src="https://automattic.com/wp-content/uploads/2024/05/referral-step-3.mp4"
				preload="auto"
				width={ 400 }
				poster={ step3 }
				muted
				autoPlay
			/>
		),
	},
	{
		title: __( 'Send your client the payment request' ),
		description: __(
			'Once sent, your client will get the invoice delivered to their inbox. After they pay, you’ll be able to assign the products to their site.'
		),
		preview: (
			<video
				src="https://automattic.com/wp-content/uploads/2024/05/referral-step-4.mp4"
				preload="auto"
				width={ 400 }
				poster={ step4 }
				muted
				autoPlay
			/>
		),
	},
	{
		title: __( 'Get paid real commissions' ),
		description: __(
			'Clients will be billed at the end of every month for their products. When they pay, you’ll make commissions on those products, which you’ll be able to manage under the Referrals section, soon.'
		),
		preview: <img src={ step5 } alt="" />,
	},
];

export default function useReferralsGuide() {
	const [ isOpen, setIsOpen ] = useState( false );

	const openGuide = useCallback( () => setIsOpen( true ), [] );
	const closeGuide = useCallback( () => setIsOpen( false ), [] );

	const guideModal = isOpen ? (
		<Guide
			className="dashboard-referrals-guide"
			contentLabel={ __( 'Product referral mode guide' ) }
			previousButtonText={ __( 'Back' ) }
			finishButtonText={ __( 'Done' ) }
			onFinish={ closeGuide }
			pages={ getSteps().map( ( { title, description, preview } ) => ( {
				image: <div className="dashboard-referrals-guide__preview">{ preview }</div>,
				content: (
					<VStack className="dashboard-referrals-guide__content" spacing={ 2 }>
						<Text className="dashboard-referrals-guide__title" as="h2">
							{ title }
						</Text>
						<Text variant="muted">{ description }</Text>
					</VStack>
				),
			} ) ) }
		/>
	) : null;

	return { openGuide, guideModal };
}
