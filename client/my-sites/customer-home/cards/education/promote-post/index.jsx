import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';
import { EDUCATION_PROMOTE_POST } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';

const PromotePost = () => {
	const { localeSlug } = useTranslate();
	const isEnglish = config( 'english_locales' ).includes( localeSlug );

	if ( ! isEnglish ) {
		return null;
	}

	return (
		<EducationalContent
			title="Promote your Posts"
			description="Reach more people promoting a post to larger WordPress.com and Tumblr community of blogs and sites."
			links={ [
				{
					externalLink: true,
					url: 'https://todo/', // todo
					text: 'Learn more',
				},
			] }
			illustration={ megaphoneIllustration }
			cardName={ EDUCATION_PROMOTE_POST }
			width="418"
			height="299"
		/>
	);
};

export default PromotePost;
