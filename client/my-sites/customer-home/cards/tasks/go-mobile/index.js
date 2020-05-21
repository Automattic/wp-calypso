/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Task from 'my-sites/customer-home/cards/tasks/task';
import { preventWidows } from 'lib/formatting';
import AppsBadge from 'blocks/get-apps/apps-badge';
import { TASK_GO_MOBILE_ANDROID, TASK_GO_MOBILE_IOS } from 'my-sites/customer-home/cards/constants';

const GoMobile = ( { isIos } ) => {
	const translate = useTranslate();

	const actionButton = isIos ? (
		<AppsBadge storeName={ 'ios' } referrer="calypso-customer-home"></AppsBadge>
	) : (
		<AppsBadge
			storeName={ 'android' }
			referrer={ 'calypso-customer-home' }
			utm_campaign={ 'mobile-download-promo-pages' }
		></AppsBadge>
	);

	return (
		<Task
			title={ preventWidows( translate( 'Update and manage on the go' ) ) }
			description={ preventWidows(
				translate(
					'Inspiration strikes any time, anywhere. Post, read, check stats, and more with the WordPress app at your fingertips.'
				)
			) }
			actionButton={ actionButton }
			timing={ 2 }
			taskId={ isIos ? TASK_GO_MOBILE_IOS : TASK_GO_MOBILE_ANDROID }
		/>
	);
};

GoMobile.propTypes = {
	isIos: PropTypes.bool,
};

export default GoMobile;
