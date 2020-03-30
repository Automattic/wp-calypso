/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isEligibleForDotcomChecklist from 'state/selectors/is-eligible-for-dotcom-checklist';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import isSiteRecentlyMigrated from 'state/selectors/is-site-recently-migrated';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { isNewSite } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import CelebrateSiteCreation from 'my-sites/customer-home/cards/notices/celebrate-site-creation';
import CelebrateSiteLaunch from 'my-sites/customer-home/cards/notices/celebrate-site-launch';
import CelebrateSiteMigration from 'my-sites/customer-home/cards/notices/celebrate-site-migration';
import CelebrateSiteSetupComplete from 'my-sites/customer-home/cards/notices/celebrate-site-setup-complete';

const Notices = ( {
	checklistMode,
	displayChecklist,
	isAtomic,
	isChecklistComplete,
	isNewlyCreatedSite,
	isRecentlyMigratedSite,
	siteIsUnlaunched,
} ) => {
	const [ showSiteSetupComplete, setShowSiteSetupComplete ] = useState( null );

	/**
	 * Updates showSiteSetupComplete to one of the values below:
	 * - `true`: if checklist has been completed on current session (prevents displaying the notice on page load).
	 * - `false`: if checklist is complete on page load.
	 * - `undefined`: if checklist has not been completed yet.
	 */
	const maybeShowSiteSetupComplete = () => {
		if ( null === isChecklistComplete || false === showSiteSetupComplete ) {
			return;
		}

		if ( null === showSiteSetupComplete ) {
			setShowSiteSetupComplete( isChecklistComplete ? false : undefined );
			return;
		}

		if ( isChecklistComplete ) {
			setShowSiteSetupComplete( true );
		}
	};

	useEffect( () => {
		maybeShowSiteSetupComplete();
	}, [ isChecklistComplete, showSiteSetupComplete ] );

	// Show a thank-you message 30 mins post site creation/purchase
	if (
		isNewlyCreatedSite &&
		! isRecentlyMigratedSite &&
		displayChecklist &&
		'launched' !== checklistMode
	) {
		if ( siteIsUnlaunched || isAtomic ) {
			//Only show pre-launch, or for Atomic sites
			return (
				<CelebrateSiteCreation
					displayChecklist={ displayChecklist }
					checklistMode={ checklistMode }
				/>
			);
		}
	}

	if ( isRecentlyMigratedSite ) {
		return (
			<CelebrateSiteMigration
				displayChecklist={ displayChecklist }
				checklistMode={ checklistMode }
			/>
		);
	}

	if ( ! siteIsUnlaunched && 'launched' === checklistMode ) {
		return (
			<CelebrateSiteLaunch displayChecklist={ displayChecklist } checklistMode={ checklistMode } />
		);
	}

	if ( showSiteSetupComplete && ! isRecentlyMigratedSite ) {
		return <CelebrateSiteSetupComplete displayChecklist={ displayChecklist } />;
	}

	return null;
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	const siteChecklist = getSiteChecklist( state, siteId );
	const hasChecklistData = null !== siteChecklist && Array.isArray( siteChecklist.tasks );
	const isChecklistComplete = isSiteChecklistComplete( state, siteId );

	return {
		displayChecklist:
			isEligibleForDotcomChecklist( state, siteId ) && hasChecklistData && ! isChecklistComplete,
		isAtomic: isAtomicSite( state, siteId ),
		isChecklistComplete,
		isNewlyCreatedSite: isNewSite( state, siteId ),
		isRecentlyMigratedSite: isSiteRecentlyMigrated( state, siteId ),
		siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
	};
};

export default connect( mapStateToProps )( Notices );
