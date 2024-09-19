import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import findSuccessPrompt from 'calypso/assets/images/customer-home/illustration--secondary-find-success.svg';
import { EDUCATION_FIND_SUCCESS } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';

const FindSuccess = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( '10 ways to find success with your website' ) }
			description={ translate(
				"You need to keep traffic coming to your site so you get leads and sales. We'll teach you how."
			) }
			links={ [
				{
					externalLink: true,
					// Not using localizeUrl() because this page doesn't exist on translated versions of the /go site
					url: localizeUrl(
						'https://wordpress.com/go/tips-and-tricks/10-ways-to-find-success-with-your-new-small-business-website/'
					),
					text: translate( 'Learn more' ),
				},
			] }
			illustration={ findSuccessPrompt }
			cardName={ EDUCATION_FIND_SUCCESS }
		/>
	);
};

export default FindSuccess;
