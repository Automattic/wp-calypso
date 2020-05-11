/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userAgent from 'lib/user-agent';
import Task from '../task';

/**
 * Image dependencies
 */
import appleStoreLogo from 'assets/images/customer-home/apple-store.png';
import googlePlayLogo from 'assets/images/customer-home/google-play.png';

const GoMobile = () => {
	const translate = useTranslate();
	const { isAndroid } = userAgent;

	return (
		<Task
			title={ translate( 'Update and manage on the go' ) }
			description={ translate(
				'Inspiration strikes any time, anywhere. Post, read, check stats, and more with the Wordpress app at your fingertips.'
			) }
			actionText={ translate( 'Remind me' ) }
			// actionUrl={ `/domains/add/${ siteSlug }` }
			illustration={ isAndroid ? googlePlayLogo : appleStoreLogo }
			timing={ 2 }
			taskId="find-domain"
		/>
	);
};
export default GoMobile;
