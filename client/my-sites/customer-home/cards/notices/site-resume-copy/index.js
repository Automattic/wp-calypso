import { useTranslate } from 'i18n-calypso';
import siteCopyIllustration from 'calypso/assets/images/customer-home/illustration--fireworks-v2.svg';
import { NOTICE_SITE_RESUME_COPY } from 'calypso/my-sites/customer-home/cards/constants';
import CelebrateNotice from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';

const SiteResumeCopy = () => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			actionText={ translate( 'Resume copying' ) }
			description={ translate(
				"You forgot something? Don't worry, we'll guide you through copying your site and launching this site."
			) }
			noticeId={ NOTICE_SITE_RESUME_COPY }
			title={ translate( 'Resume copying site!' ) }
			illustration={ siteCopyIllustration }
			showSkip={ false }
		/>
	);
};

export default SiteResumeCopy;
