import { translate } from 'i18n-calypso';
import { errorNotice } from 'calypso/state/notices/actions';

const NOTICE_PERSISTENT = true;
const NOTICE_DURATION = 5000;

export const onRetrievingFileInfoError = () => {
	return errorNotice(
		translate( 'There was an error retrieving your file information. Please, try again.' ),
		{
			duration: NOTICE_DURATION,
			isPersistent: NOTICE_PERSISTENT,
		}
	);
};

export const onProcessingDownloadError = () => {
	return errorNotice(
		translate( 'There was an error processing your download. Please, try again.' ),
		{
			duration: NOTICE_DURATION,
			isPersistent: NOTICE_PERSISTENT,
		}
	);
};

export const onPreparingDownloadError = () => {
	return errorNotice(
		translate( 'There was an error preparing your download. Please, try again.' ),
		{
			duration: NOTICE_DURATION,
			isPersistent: NOTICE_PERSISTENT,
		}
	);
};
