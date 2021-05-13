/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { preventWidows } from 'calypso/lib/formatting';
import AppsBadge from 'calypso/blocks/get-apps/apps-badge';
import {
	TASK_GO_MOBILE_ANDROID,
	TASK_GO_MOBILE_IOS,
} from 'calypso/my-sites/customer-home/cards/constants';

const GoMobile = ( { isIos } ) => {
	const translate = useTranslate();

	const actionButton = isIos ? (
		<AppsBadge storeName={ 'ios' } utm_source="calypso-customer-home"></AppsBadge>
	) : (
		<AppsBadge storeName={ 'android' } utm_source={ 'calypso-customer-home' }></AppsBadge>
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
