/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { TASK_EARN_FEATURES } from 'calypso/my-sites/customer-home/cards/constants';
import earnIllustration from 'calypso/assets/images/customer-home/illustration--task-earn.svg';

const EarnFeatures = ( { siteSlug } ) => {
	const translate = useTranslate();

	return (
		<Task
			title={ translate( 'Make money from your website' ) }
			description={ translate(
				'Sell just about anything to your visitors — physical items, digital downloads, memberships, exclusive content, and more.'
			) }
			actionText={ translate( 'Start making money' ) }
			actionUrl={ `/earn/${ siteSlug }` }
			completeOnStart={ false }
			illustration={ earnIllustration }
			taskId={ TASK_EARN_FEATURES }
		/>
	);
};

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( EarnFeatures );
