/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Checklist from 'blocks/checklist-v2';
import Item from 'blocks/checklist-v2/item';

export function JetpackChecklist( { siteId, translate } ) {
	return (
		<Checklist siteId={ siteId }>
			<Item
				siteId={ siteId }
				taskId="jetpack_brute_force"
				completedTitle={ translate(
					"We've automatically protected you from brute force login attacks."
				) }
				completed
			/>
			<Item
				siteId={ siteId }
				taskId="jetpack_spam_filtering"
				completedTitle={ translate( "We've automatically turned on spam filtering." ) }
				completed
			/>
			<Item
				siteId={ siteId }
				taskId="jetpack_backups"
				title={ translate( 'Backups & Scanning' ) }
				description={ translate(
					"Connect your site's server to Jetpack to perform backups, rewinds, and security scans."
				) }
				completed
				completedTitle={ translate( 'You turned on backups and scanning.' ) }
				completedButtonText={ translate( 'Change' ) }
				duration={ translate( '2 min' ) }
				url="/stats/activity/$siteSlug"
			/>
			<Item
				siteId={ siteId }
				taskId="jetpack_monitor"
				title={ translate( 'Jetpack Monitor' ) }
				description={ translate(
					"Monitor your site's uptime and alert you the moment downtime is detected with instant notifications."
				) }
				completedTitle={ translate( 'You turned on Jetpack Monitor.' ) }
				completedButtonText={ translate( 'Change' ) }
				duration={ translate( '3 min' ) }
				tourId="jetpackMonitoring"
				tourUrl="/settings/security/$siteSlug"
			/>
			<Item
				siteId={ siteId }
				taskId="jetpack_plugin_updates"
				title={ translate( 'Automatic Plugin Updates' ) }
				description={ translate(
					'Choose which WordPress plugins you want to keep automatically updated.'
				) }
				completedTitle={ translate( 'You turned on automatic plugin updates.' ) }
				completedButtonText={ translate( 'Change' ) }
				duration={ translate( '3 min' ) }
				url="/plugins/manage/$siteSlug"
			/>
			<Item
				siteId={ siteId }
				taskId="jetpack_sign_in"
				title={ translate( 'WordPress.com sign in' ) }
				description={ translate(
					'Manage your log in preferences and two-factor authentication settings.'
				) }
				completedTitle={ translate( 'You completed your sign in preferences.' ) }
				completedButtonText={ translate( 'Change' ) }
				duration={ translate( '3 min' ) }
				tourId="jetpackSignIn"
				tourUrl="/settings/security/$siteSlug"
			/>
		</Checklist>
	);
}

JetpackChecklist.propTypes = {
	translate: PropTypes.func.isRequired,
	siteId: PropTypes.number.isRequired,
};

export default localize( JetpackChecklist );
