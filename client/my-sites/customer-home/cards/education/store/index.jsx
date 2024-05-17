import { useTranslate } from 'i18n-calypso';
import storeCardPrompt from 'calypso/assets/images/customer-home/home-education-store.svg';
import EducationalContent from '../educational-content';

export const EDUCATION_STORE = 'home-education-store';

const EducationStore = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'How to set up an online store' ) }
			description={ translate(
				'Payments features on WordPress.com allow you to make money from your site in many ways.'
			) }
			links={ [
				{
					externalLink: true,
					// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
					url: `https://wordpress.com/support/video-tutorials-add-payments-features-to-your-site-with-our-guides/`,
					text: translate( 'Learn how' ),
				},
			] }
			illustration={ storeCardPrompt }
			cardName={ EDUCATION_STORE }
			width="115"
			height="114"
		/>
	);
};

export default EducationStore;
