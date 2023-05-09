import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import wpLearnLogo from 'calypso/assets/images/customer-home/illustration--secondary-wp-learn.png';
import { EDUCATION_WPCOURSES } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';

const WpCourses = () => {
	const { localeSlug } = useTranslate();
	const isEnglish = config( 'english_locales' ).includes( localeSlug );

	if ( ! isEnglish ) {
		return null;
	}

	return (
		<EducationalContent
			title="World-class education by WordPress&nbsp;experts"
			description="Build your skills with access to webinars, courses, articles, support docs, a community and more! No enrollment required. No deadlines. Learn at your own pace."
			links={ [
				{
					externalLink: true,
					url: 'https://wordpress.com/learn/?utm_source=wordpressdotcom&utm_medium=referral&utm_campaign=customer_home_card',
					text: 'Learn more',
				},
			] }
			illustration={ wpLearnLogo }
			cardName={ EDUCATION_WPCOURSES }
			width="400"
			height="300"
		/>
	);
};

export default WpCourses;
