import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import affiliatesIllustration from 'calypso/assets/images/customer-home/illustration--affiliates-icons-small.png';
import EducationalContent from '../educational-content';
export const EDUCATION_EARN = 'home-education-earn';

const EducationAffiliates = () => {
	const translate = useTranslate();
	const hasTranslation = useHasEnTranslation();

	const title = translate( 'Earn with the Automattic Affiliate Program' );
	const hasTitleTranaslation = hasTranslation( title );

	const description = translate(
		'Join the Automattic Affiliate Program and get up to 100% payouts by promoting one or more of Automattic’s trusted, profitable products.'
	);
	const hasDescriptionTranslations = hasTranslation( description );

	if ( ! hasTitleTranaslation || ! hasDescriptionTranslations ) {
		EducationAffiliates.isDisabled = true;
		return null;
	}
	return (
		<EducationalContent
			title={ title }
			description={ description }
			links={ [
				{
					calypsoLink: true,
					url: `https://app.impact.com/campaign-campaign-info-v2/Automattic-Inc.brand?ref=wordpressdotcom`,
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
