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
import { restoreWpConfig } from 'state/hosting/actions';
import { connect } from 'react-redux';
import { getSelectedSiteId } from 'state/ui/selectors';

const RestoreWpConfig = ( { restore, translate } ) => (
	<Notice
		status="is-error"
		text={ translate(
			"Your site's wp-config.php file seems to be missing. Get your site back on track by restoring it."
		) }
		showDismiss={ false }
	>
		<NoticeAction href="#" onClick={ restore }>
			{ translate( 'Restore file' ) }
		</NoticeAction>
	</Notice>
);

export default connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
	} ),
	{
		restore: restoreWpConfig,
	}
)( localize( RestoreWpConfig ) );
