/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteUrl } from 'calypso/state/sites/selectors';
import { TASK_SITE_SETUP_CHECKLIST_ECOMMERCE } from 'calypso/my-sites/customer-home/cards/constants';
import earnSectionImage from 'calypso/assets/images/earn/earn-section.svg';

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
			illustration={ earnSectionImage }
			taskId={ TASK_SITE_SETUP_CHECKLIST_ECOMMERCE }
			timing={ 7 }
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
