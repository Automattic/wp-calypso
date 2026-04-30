import { useTranslate } from 'i18n-calypso';
import siteCopyIllustration from 'calypso/assets/images/customer-home/illustration--fireworks-v2.svg';
import { NOTICE_CELEBRATE_SITE_COPY } from 'calypso/my-sites/customer-home/cards/constants';
import CelebrateNotice from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';

const CelebrateSiteCopy = () => {
	const translate = useTranslate();
	return (
		<CelebrateNotice
			actionText={ translate( 'Finish setting up your site' ) }
			description={ translate(
				'Now it’s time to choose a name and customize a few settings to make it unique.'
			) }
			noticeId={ NOTICE_CELEBRATE_SITE_COPY }
			title={ translate( 'Your copied site is ready!' ) }
			illustration={ siteCopyIllustration }
			showSkip={ false }
		/>
	);
};

export default CelebrateSiteCopy;
