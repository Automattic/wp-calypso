import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';
import { EDUCATION_PROMOTE_POST } from 'calypso/my-sites/customer-home/cards/constants';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import EducationalContent from '../educational-content';

const PromotePost = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );
	// todo no tracks here yet
	return (
		<EducationalContent
			title={ translate( 'Promote your posts and pages' ) }
			description={ translate(
				'Increase your reach by promoting your work to the larger WordPress.com community of blogs and sites.'
			) }
			links={ [
				{
					calypsoLink: true,
					url: `/advertising/${ siteSlug }`,
					text: translate( 'Start promoting' ),
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
