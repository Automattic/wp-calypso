/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Task from 'my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteUrl } from 'state/sites/selectors';
import { TASK_SITE_SETUP_CHECKLIST_ECOMMERCE } from 'my-sites/customer-home/cards/constants';

export const SiteSetupListEcommerce = ( { siteUrl } ) => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Finish store setup' ) }
			description={ translate(
				"You're not ready to receive orders until you complete store setup."
			) }
			actionText={ translate( 'Finish store setup' ) }
			actionUrl={ `${ siteUrl }/wp-admin/admin.php?page=wc-admin&calypsoify=1` }
			completeOnStart={ true }
			taskId={ TASK_SITE_SETUP_CHECKLIST_ECOMMERCE }
		/>
	);
};

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteUrl: getSiteUrl( state, siteId ),
	};
};

export default connect( mapStateToProps )( SiteSetupListEcommerce );
