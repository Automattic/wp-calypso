/** @format */

/**
 * External dependencies
 */
import page from 'page';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, includes, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Checklist, Task } from 'components/checklist';
import getJetpackProductInstallStatus from 'state/selectors/get-jetpack-product-install-status';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import getRewindState from 'state/selectors/get-rewind-state';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
import JetpackChecklistHeader from './header';
import QueryJetpackProductInstallStatus from 'components/data/query-jetpack-product-install-status';
import QueryRewindState from 'components/data/query-rewind-state';
import QuerySiteChecklist from 'components/data/query-site-checklist';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { isDesktop } from 'lib/viewport';
import {
	JETPACK_CHECKLIST_TASKS,
	JETPACK_CHECKLIST_TASK_AKISMET,
	JETPACK_CHECKLIST_TASK_BACKUPS_REWIND,
	JETPACK_CHECKLIST_TASK_BACKUPS_VAULTPRESS,
	JETPACK_CHECKLIST_TASK_PROTECT,
} from './constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';

/**
 * Style dependencies
 */
import './style.scss';

class JetpackChecklist extends PureComponent {
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
		const {
			akismetFinished,
			isPaidPlan,
			productInstallStatus,
			rewindState,
			siteId,
			siteSlug,
			taskStatuses,
			translate,
			vaultpressFinished,
		} = this.props;

		const isRewindActive = rewindState === 'active' || rewindState === 'provisioning';
		const isRewindAvailable = rewindState !== 'uninitialized' && rewindState !== 'unavailable';
		const isRewindUnAvailable = rewindState === 'unavailable';

		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ isPaidPlan && <QueryJetpackProductInstallStatus siteId={ siteId } /> }
				{ isPaidPlan && <QueryRewindState siteId={ siteId } /> }

				<JetpackChecklistHeader />

				<Checklist
					isPlaceholder={ ! taskStatuses }
					progressText={ translate( 'Your Jetpack setup progress' ) }
				>
					<Task
						completed
						{ ...JETPACK_CHECKLIST_TASK_PROTECT }
						onClick={ this.handleTaskStart( {
							taskId: 'jetpack_protect',
							url: JETPACK_CHECKLIST_TASK_PROTECT.getUrl( siteSlug ),
						} ) }
					/>
					{ isPaidPlan && isRewindAvailable && (
						<Task
							{ ...JETPACK_CHECKLIST_TASK_BACKUPS_REWIND }
							onClick={ this.handleTaskStart( {
								taskId: 'jetpack_backups',
								url: JETPACK_CHECKLIST_TASK_BACKUPS_REWIND.getUrl( siteSlug ),
								tourId: isRewindActive ? undefined : 'jetpackBackupsRewind',
							} ) }
							completed={ isRewindActive }
						/>
					) }
					{ isPaidPlan && isRewindUnAvailable && productInstallStatus && (
						<Task
							{ ...JETPACK_CHECKLIST_TASK_BACKUPS_VAULTPRESS }
							onClick={ this.handleTaskStart( {
								taskId: 'jetpack_backups',
								url: JETPACK_CHECKLIST_TASK_BACKUPS_VAULTPRESS.getUrl( siteSlug ),
							} ) }
							completed={ vaultpressFinished }
							inProgress={ ! vaultpressFinished }
						/>
					) }
					{ isPaidPlan && productInstallStatus && (
						<Task
							{ ...JETPACK_CHECKLIST_TASK_AKISMET }
							onClick={ this.handleTaskStart( {
								taskId: 'jetpack_spam_filtering',
								url: JETPACK_CHECKLIST_TASK_AKISMET.getUrl( siteSlug ),
							} ) }
							completed={ akismetFinished }
							inProgress={ ! akismetFinished }
						/>
					) }
					{ map( taskStatuses, ( status, taskId ) => {
						const task = JETPACK_CHECKLIST_TASKS[ taskId ];

						if ( ! task ) {
							// UI does not support this task.
							return;
						}

						return (
							<Task
								completed={ get( status, 'completed', false ) }
								completedButtonText={ task.completedButtonText }
								completedTitle={ task.completedTitle }
								description={ task.description }
								duration={ task.duration }
								onClick={ this.handleTaskStart( {
									taskId,
									url: task.getUrl( siteSlug ),
									tourId: get( task, 'tourId', null ),
								} ) }
								title={ task.title }
								key={ taskId }
							/>
						);
					} ) }
				</Checklist>
			</Fragment>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const productInstallStatus = getJetpackProductInstallStatus( state, siteId );
		const rewindState = get( getRewindState( state, siteId ), 'state', 'uninitialized' );

		return {
			akismetFinished: productInstallStatus && productInstallStatus.akismet_status === 'installed',
			vaultpressFinished:
				productInstallStatus &&
				includes( [ 'installed', 'skipped' ], productInstallStatus.vaultpress_status ),
			isPaidPlan: isSiteOnPaidPlan( state, siteId ),
			rewindState,
			productInstallStatus,
			siteId,
			siteSlug: getSiteSlug( state, siteId ),
			taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ] ),
		};
	},
	{
		recordTracksEvent,
		requestGuidedTour,
	}
)( localize( JetpackChecklist ) );
