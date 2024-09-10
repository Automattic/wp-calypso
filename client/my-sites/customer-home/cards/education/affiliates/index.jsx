import { useTranslate } from 'i18n-calypso';
import affiliatesIllustration from 'calypso/assets/images/customer-home/illustration--affiliates-icons-small.png';
import EducationalContent from '../educational-content';
export const EDUCATION_EARN = 'home-education-earn';

const EducationAffiliates = () => {
	const translate = useTranslate();

	const title = translate( 'Earn with the Automattic Affiliate Program' );
	const description = translate(
		'Join the Automattic Affiliate Program and get up to 100% payouts by promoting one or more of Automattic’s trusted, profitable products.'
	);

	return (
		<EducationalContent
			title={ title }
			description={ description }
			links={ [
				{
					externalLink: true,
					url: `https://automattic.com/affiliates/?ref=wordpressdotcom_education_home_card`,
					text: translate( 'Sign up' ),
				},
			] }
			illustration={ affiliatesIllustration }
			cardName={ EDUCATION_EARN }
			width="201"
			height="114"
		/>
	);
};

export default EducationAffiliates;
