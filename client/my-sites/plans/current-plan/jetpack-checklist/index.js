/** @format */

/**
 * External dependencies
 */
import page from 'page';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Checklist from 'components/checklist';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import Task from 'components/checklist/task';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { isDesktop } from 'lib/viewport';
import { loadTrackingTool, recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

class JetpackChecklist extends PureComponent {
	componentDidMount() {
		this.props.loadTrackingTool( 'HotJar' );
	}

	isComplete( taskId ) {
		return get( this.props.taskStatuses, [ taskId, 'completed' ], false );
	}

	handleTaskStart = ( { taskId, tourId, url } ) => () => {
		if ( ! tourId && ! url ) {
			return;
		}

		this.props.recordTracksEvent( 'calypso_checklist_task_start', {
			checklist_name: 'jetpack',
			location: 'JetpackChecklist',
			step_name: taskId,
		} );

		if ( tourId && ! this.isComplete( taskId ) && isDesktop() ) {
			this.props.requestGuidedTour( tourId );
		}

		if ( url ) {
			page.show( url );
		}
	};

	render() {
		const { siteId, siteSlug, taskStatuses, translate } = this.props;

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				<Checklist isPlaceholder={ ! taskStatuses }>
					<Task
						completed
						title={ translate(
							"We've automatically protected you from brute force login attacks."
						) }
					/>
					<Task completed title={ translate( "We've automatically turned on spam filtering." ) } />
					<Task
						completed
						completedButtonText={ translate( 'Change' ) }
						completedTitle={ translate( 'You turned on backups and scanning.' ) }
						description={ translate(
							"Connect your site's server to Jetpack to perform backups, rewinds, and security scans."
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_backups',
							url: `/stats/activity/${ siteSlug }`,
						} ) }
						title={ translate( 'Backups & Scanning' ) }
					/>
					<Task
						completed={ this.isComplete( 'jetpack_monitor' ) }
						completedButtonText={ translate( 'Change' ) }
						completedTitle={ translate( 'You turned on Jetpack Monitor.' ) }
						description={ translate(
							"Monitor your site's uptime and alert you the moment downtime is detected with instant notifications."
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_monitor',
							tourId: 'jetpackMonitoring',
							url: `/settings/security/${ siteSlug }`,
						} ) }
						title={ translate( 'Jetpack Monitor' ) }
					/>
					<Task
						completed={ this.isComplete( 'jetpack_plugin_updates' ) }
						completedButtonText={ translate( 'Change' ) }
						completedTitle={ translate( 'You turned on automatic plugin updates.' ) }
						description={ translate(
							'Choose which WordPress plugins you want to keep automatically updated.'
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_plugin_updates',
							tourId: 'jetpackPluginUpdates',
							url: `/plugins/manage/${ siteSlug }`,
						} ) }
						title={ translate( 'Automatic Plugin Updates' ) }
					/>
					<Task
						completed={ this.isComplete( 'jetpack_sign_in' ) }
						completedButtonText={ translate( 'Change' ) }
						completedTitle={ translate( 'You completed your sign in preferences.' ) }
						description={ translate(
							'Manage your log in preferences and two-factor authentication settings.'
						) }
						duration={ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_sign_in',
							tourId: 'jetpackSignIn',
							url: `/settings/security/${ siteSlug }`,
						} ) }
						title={ translate( 'WordPress.com sign in' ) }
					/>
				</Checklist>
			</Fragment>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
			taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
		};
	},
	{
		loadTrackingTool,
		recordTracksEvent,
		requestGuidedTour,
	}
)( localize( JetpackChecklist ) );
