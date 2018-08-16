/** @format */

/**
 * External dependencies
 */
import page from 'page';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { isDesktop } from 'lib/viewport';
import Checklist from 'components/checklist';
import Task from 'components/checklist/task';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import { getSiteSlug } from 'state/sites/selectors';
import QuerySiteChecklist from 'components/data/query-site-checklist';
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
			step_name: taskId,
			location: 'JetpackChecklist',
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
						title={ translate(
							"We've automatically protected you from brute force login attacks."
						) }
						completed
					/>
					<Task title={ translate( "We've automatically turned on spam filtering." ) } completed />
					<Task
						title={ translate( 'Backups & Scanning' ) }
						description={ translate(
							"Connect your site's server to Jetpack to perform backups, rewinds, and security scans."
						) }
						completed
						completedTitle={ translate( 'You turned on backups and scanning.' ) }
						completedButtonText={ translate( 'Change' ) }
						duration={ translate( '%d minute', '%d minutes', { count: 2, args: [ 2 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_backups',
							url: `/stats/activity/${ siteSlug }`,
						} ) }
					/>
					<Task
						completed={ this.isComplete( 'jetpack_monitor' ) }
						title={ translate( 'Jetpack Monitor' ) }
						description={ translate(
							"Monitor your site's uptime and alert you the moment downtime is detected with instant notifications."
						) }
						completedTitle={ translate( 'You turned on Jetpack Monitor.' ) }
						completedButtonText={ translate( 'Change' ) }
						duration={ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_monitor',
							tourId: 'jetpackMonitoring',
							url: `/settings/security/${ siteSlug }`,
						} ) }
					/>
					<Task
						completed={ this.isComplete( 'jetpack_plugin_updates' ) }
						title={ translate( 'Automatic Plugin Updates' ) }
						description={ translate(
							'Choose which WordPress plugins you want to keep automatically updated.'
						) }
						completedTitle={ translate( 'You turned on automatic plugin updates.' ) }
						completedButtonText={ translate( 'Change' ) }
						duration={ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_plugin_updates',
							tourId: 'jetpackPluginUpdates',
							url: `/plugins/manage/${ siteSlug }`,
						} ) }
					/>
					<Task
						completed={ this.isComplete( 'jetpack_sign_in' ) }
						title={ translate( 'WordPress.com sign in' ) }
						description={ translate(
							'Manage your log in preferences and two-factor authentication settings.'
						) }
						completedTitle={ translate( 'You completed your sign in preferences.' ) }
						completedButtonText={ translate( 'Change' ) }
						duration={ translate( '%d minute', '%d minutes', { count: 3, args: [ 3 ] } ) }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_sign_in',
							tourId: 'jetpackSignIn',
							url: `/settings/security/${ siteSlug }`,
						} ) }
					/>
				</Checklist>
			</Fragment>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
	};
};

const mapDispatchToProps = {
	loadTrackingTool,
	recordTracksEvent,
	requestGuidedTour,
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( JetpackChecklist ) );
