/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { connect, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { savePreference } from 'state/preferences/actions';
import getSiteTaskList from 'state/selectors/get-site-task-list';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import { getSelectedSiteId } from 'state/ui/selectors';
import CelebrateNotice from '../celebrate-notice';

/**
 * Image dependencies
 */
import launchedIllustration from 'assets/images/customer-home/illustration--rocket.svg';

const CelebrateSiteLaunch = ( { isSiteSetupComplete, pendingSiteSetupTasks, siteId } ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const skipSiteSetup = () => {
		// Mark all pending tasks as completed.
		pendingSiteSetupTasks.forEach( ( task ) =>
			dispatch( requestSiteChecklistTaskUpdate( siteId, task.id ) )
		);

		// Dismisses the site setup complete celebratory notice.
		dispatch(
			savePreference( `dismissible-card-home-notice-site-setup-complete-${ siteId }`, true )
		);
	};

	return (
		<CelebrateNotice
			actionText={
				isSiteSetupComplete ? translate( "Show me what's next" ) : translate( 'Show site setup' )
			}
			description={
				isSiteSetupComplete
					? translate(
							"Don't forget to share your hard work with everyone. Keep up the momentum with some guidance on what to do next."
					  )
					: translate(
							"Don't forget to share your hard work with everyone. Then keep working through your site setup list."
					  )
			}
			noticeId="site-launched"
			title={ translate( 'You launched your site!' ) }
			illustration={ launchedIllustration }
			showSkip={ true }
			skipText={ isSiteSetupComplete ? translate( 'Dismiss' ) : translate( 'Skip site setup' ) }
			onSkip={ ! isSiteSetupComplete ? skipSiteSetup : null }
		/>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isSiteSetupComplete = isSiteChecklistComplete( state, siteId );
	let pendingSiteSetupTasks = [];
	if ( ! isSiteSetupComplete ) {
		const tasks = getSiteTaskList( state, siteId ).getAll();
		// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
		pendingSiteSetupTasks = tasks.filter( ( task ) => ! task.isCompleted );
	}
	return {
		isSiteSetupComplete,
		pendingSiteSetupTasks,
		siteId,
	};
} )( CelebrateSiteLaunch );
