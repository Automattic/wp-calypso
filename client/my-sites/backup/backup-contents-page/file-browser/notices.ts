import { __ } from '@wordpress/i18n';
import { errorNotice } from 'calypso/state/notices/actions';

const NOTICE_PERSISTENT = true;
const NOTICE_DURATION = 5000;

export const onRetrievingFileInfoError = () => {
	return errorNotice(
		__( 'There was an error retrieving your file information. Please, try again.' ),
		{
			duration: NOTICE_DURATION,
			isPersistent: NOTICE_PERSISTENT,
		}
	);
};

export const onProcessingDownloadError = () => {
	return errorNotice( __( 'There was an error processing your download. Please, try again.' ), {
		duration: NOTICE_DURATION,
		isPersistent: NOTICE_PERSISTENT,
	} );
};

export const onPreparingDownloadError = () => {
	return errorNotice( __( 'There was an error preparing your download. Please, try again.' ), {
		duration: NOTICE_DURATION,
		isPersistent: NOTICE_PERSISTENT,
	} );
};
