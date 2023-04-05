import { __ } from '@wordpress/i18n';
import stagingIllustration from 'calypso/assets/images/customer-home/illustration--staging.svg';
import { NOTICE_STAGING_SITE } from 'calypso/my-sites/customer-home/cards/constants';
import CelebrateNotice from 'calypso/my-sites/customer-home/cards/notices/celebrate-notice';

const StagingSiteNotice = () => {
	return (
		<CelebrateNotice
			description={ __(
				'This is a staging site that you can use to try out new plugins and themes, debug and troubleshoot changes, and fine-tune every aspect of your website without worrying about breaking your live site.'
			) }
			noticeId={ NOTICE_STAGING_SITE }
			title={ __( 'Staging site' ) }
			illustration={ stagingIllustration }
			showAction={ false }
			showSkip={ false }
		/>
	);
};

export default StagingSiteNotice;
