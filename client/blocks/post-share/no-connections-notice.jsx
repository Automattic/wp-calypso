/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

const NoConnectionsNotice = ( { siteSlug, translate } ) => (
	<Notice
		status="is-warning"
		showDismiss={ false }
		text={ translate( 'Connect an account to get started.' ) }
	>
		<NoticeAction href={ `/sharing/${ siteSlug }` }>{ translate( 'Settings' ) }</NoticeAction>
	</Notice>
);

export default localize( NoConnectionsNotice );
