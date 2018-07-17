/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get, reduce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Checklist from 'components/checklist';
import ConnectedItem from 'blocks/checklist/item';
import Item from 'components/checklist/item';
import getSiteChecklist from 'state/selectors/get-site-checklist';

class JetpackChecklist extends PureComponent {
	static propTypes = {
		checklistTasks: PropTypes.shape( {
			completed: PropTypes.bool,
		} ),
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

	static taskIds = new Set( [
		'jetpack_backups',
		'jetpack_monitor',
		'jetpack_plugin_updates',
		'jetpack_sign_in',
	] );

	render() {
		const { siteId, translate, checklistTasks } = this.props;

		const completedCount = reduce(
			checklistTasks,
			( count, { completed = false }, taskId ) =>
				completed && JetpackChecklist.taskIds.has( taskId ) ? count + 1 : count,

			2 // 2 tasks are statically completed
		);

		return (
			<Checklist completedCount={ completedCount }>
				<Item
					title={ translate( "We've automatically protected you from brute force login attacks." ) }
					completed
				/>
				<Item title={ translate( "We've automatically turned on spam filtering." ) } completed />
				<ConnectedItem
					siteId={ siteId }
					taskId="jetpack_backups"
					title={ translate( 'Backups & Scanning' ) }
					description={ translate(
						"Connect your site's server to Jetpack to perform backups, rewinds, and security scans."
					) }
					completedTitle={ translate( 'You turned on backups and scanning.' ) }
					completedButtonText={ translate( 'Change' ) }
					duration={ translate( '2 min' ) }
					url="/stats/activity/$siteSlug"
				/>
				<ConnectedItem
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
				<ConnectedItem
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
				<ConnectedItem
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
}

export default connect( ( state, { siteId } ) => ( {
	checklistTasks: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
} ) )( localize( JetpackChecklist ) );
