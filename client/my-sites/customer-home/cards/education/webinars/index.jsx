import { useTranslate } from 'i18n-calypso';
import webinarIllustration from 'calypso/assets/images/customer-home/illustration-webinars.svg';
import EducationalContent from '../educational-content';

const Webinars = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'Learn from the pros' ) }
			description={ translate(
				'Free webinars with Happiness Engineers teach you to build a website, start a blog, or make money on your site.'
			) }
			links={ [
				{
					externalLink: true,
					url: 'https://wordpress.com/webinars/',
					text: translate( 'Register for free' ),
				},
			] }
			illustration={ webinarIllustration }
		/>
	);
};

export default Webinars;
