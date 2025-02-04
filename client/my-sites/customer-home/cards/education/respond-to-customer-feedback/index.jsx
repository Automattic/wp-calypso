import { useTranslate } from 'i18n-calypso';
import respondToCustomerFeedbackPrompt from 'calypso/assets/images/customer-home/illustration--secondary-respond-to-customer-feedback.svg';
import { EDUCATION_RESPOND_TO_CUSTOMER_FEEDBACK } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';

const RespondToCustomerFeedback = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'How to respond to customer feedback' ) }
			description={ translate(
				'Customer feedback can help grow your business. Learn how to absorb and respond to customers at the right time.'
			) }
			links={ [
				{
					externalLink: true,
					// Not using localizeUrl() because this page doesn't exist on translated versions of the /go site
					// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
					url: 'https://wordpress.com/go/content-blogging/how-to-respond-to-customer-feedback/',
					text: translate( 'Learn more' ),
				},
			] }
			illustration={ respondToCustomerFeedbackPrompt }
			cardName={ EDUCATION_RESPOND_TO_CUSTOMER_FEEDBACK }
		/>
	);
};

export default RespondToCustomerFeedback;
