/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
// import config from '@automattic/calypso-config';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { TASK_UPSELL_TITAN } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import titanUpsellIllustration from 'calypso/assets/images/customer-home/illustration--titan-banner.svg';

const TitanBanner = () => {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug ); // getSelectedSiteSlug should be imported from 'calypso/state/ui/selectors'
	const emailComparisonPath = emailManagement( siteSlug, siteSlug );

	return (
		<Task
			title={ translate( 'Get email @ your domain' ) }
			description={ translate(
				'Brand yourself and build trust with a custom email address @ your domain, free for 3 months.'
			) }
			actionText={ translate( 'Get email' ) }
			actionUrl={ emailComparisonPath }
			actionTarget="_blank"
			completeOnStart={ false }
			enableSkipOptions={ true }
			illustration={ titanUpsellIllustration }
			taskId={ TASK_UPSELL_TITAN }
			timing={ 2 }
		/>
	);
};

export default TitanBanner;
