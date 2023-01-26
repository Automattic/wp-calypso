import { useTranslate } from 'i18n-calypso';
import siteCopyIllustration from 'calypso/assets/images/customer-home/illustration--fireworks-v2.svg';
import { NOTICE_CELEBRATE_SITE_COPY } from 'calypso/my-sites/customer-home/cards/constants';
import CelebrateNotice from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';

const CelebrateSiteCopy = () => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			actionText={ translate( 'Show site setup' ) }
			description={ translate(
				"Now it’s your turn to make it unique. Don't worry, we'll guide you through setting up and launching this site."
			) }
			noticeId={ NOTICE_CELEBRATE_SITE_COPY }
			title={ translate( 'Your copy is ready!' ) }
			illustration={ siteCopyIllustration }
			showSkip={ false }
		/>
	);
};

export default CelebrateSiteCopy;
