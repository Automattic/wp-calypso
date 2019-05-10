/** @format */

/**
 * External dependencies
 */
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, includes, map, orderBy } from 'lodash';
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

	handleTaskStart = ( { taskId, tourId } ) => () => {
		if ( taskId ) {
			this.props.recordTracksEvent( 'calypso_checklist_task_start', {
				checklist_name: 'jetpack',
				location: 'JetpackChecklist',
				step_name: taskId,
			} );
		}

		if ( tourId && ! this.isComplete( taskId ) && isDesktop() ) {
			this.props.requestGuidedTour( tourId );
		}
	};

	getTaskDefinitions() {
		const {
			akismetFinished,
			rewindState,
			vaultpressFinished,
			isPaidPlan,
			productInstallStatus,
			taskStatuses,
		} = this.props;

		const isRewindActive = rewindState === 'active' || rewindState === 'provisioning';
		const isRewindAvailable = rewindState !== 'uninitialized' && rewindState !== 'unavailable';
		const isRewindUnAvailable = rewindState === 'unavailable';

		const taskDefinitions = [
			{
				id: 'jetpack_protect',
				completed: true,
			},
		];

		if ( isPaidPlan && productInstallStatus ) {
			taskDefinitions.push( {
				id: 'jetpack_spam_filtering',
				completed: akismetFinished,
				inProgress: ! akismetFinished,
				target: '_blank',
			} );
		}

		if ( isPaidPlan && isRewindAvailable  ) {
			taskDefinitions.push( {
				id: 'jetpack_backups_rewind',
				completed: isRewindActive,
				onClick: this.handleTaskStart( {
					taskId: 'jetpack_backups',
					tourId: isRewindActive ? undefined : 'jetpackBackupsRewind',
				} ),
			} );
		}

		if ( isPaidPlan && isRewindUnAvailable && productInstallStatus ) {
			taskDefinitions.push( {
				id: 'jetpack_backups_vaultpress',
				completed: vaultpressFinished,
				inProgress: ! vaultpressFinished,
				onClick: this.handleTaskStart( { taskId: 'jetpack_backups' } ),
			} );
		}

		return orderBy( {
			...taskDefinitions,
			...map( taskStatuses, ( value, id ) => ( { id, completed: typeof value.completed === 'boolean' ? value.completed : false } ) ),
		}, [ 'completed', 'id' ], [ 'desc', 'asc' ] );
	}

	render() {
		const {
			isPaidPlan,
			siteId,
			siteSlug,
			taskStatuses,
			translate,
		} = this.props;


		return (
			<Fragment>
				{ siteId && <QuerySiteChecklist siteId={ siteId } /> }
				{ isPaidPlan && <QueryJetpackProductInstallStatus siteId={ siteId } /> }
				{ isPaidPlan && <QueryRewindState siteId={ siteId } /> }

				<JetpackChecklistHeader isPaidPlan={ isPaidPlan } />

				<Checklist
					isPlaceholder={ ! taskStatuses }
					progressText={ translate( 'Your Jetpack setup progress' ) }
				>
{/*					<Task
						{ ...JETPACK_CHECKLIST_TASK_PROTECT }
						completed
						href={ JETPACK_CHECKLIST_TASK_PROTECT.getUrl( siteSlug ) }
						onClick={ this.handleTaskStart( { taskId: 'jetpack_protect' } ) }
					/>
					{ isPaidPlan && isRewindAvailable && (
						<Task
							{ ...JETPACK_CHECKLIST_TASK_BACKUPS_REWIND }
							completed={ isRewindActive }
							href={ JETPACK_CHECKLIST_TASK_BACKUPS_REWIND.getUrl( siteSlug ) }
							onClick={ this.handleTaskStart( {
								taskId: 'jetpack_backups',
								tourId: isRewindActive ? undefined : 'jetpackBackupsRewind',
							} ) }
						/>
					) }
					{ isPaidPlan && isRewindUnAvailable && productInstallStatus && (
						<Task
							{ ...JETPACK_CHECKLIST_TASK_BACKUPS_VAULTPRESS }
							completed={ vaultpressFinished }
							href={ JETPACK_CHECKLIST_TASK_BACKUPS_VAULTPRESS.getUrl( siteSlug ) }
							inProgress={ ! vaultpressFinished }
							onClick={ this.handleTaskStart( { taskId: 'jetpack_backups' } ) }
						/>
					) }
					{ isPaidPlan && productInstallStatus && (
						<Task
							{ ...JETPACK_CHECKLIST_TASK_AKISMET }
							completed={ akismetFinished }
							href={ JETPACK_CHECKLIST_TASK_AKISMET.getUrl( siteSlug ) }
							inProgress={ ! akismetFinished }
							onClick={ this.handleTaskStart( { taskId: 'jetpack_spam_filtering' } ) }
							target="_blank"
						/>
					) }*/}

					{ this.getTaskDefinitions().map( taskDefinition => {
						const task = JETPACK_CHECKLIST_TASKS[ taskDefinition.id ];

						if ( ! task ) {
							// UI does not support this task.
							return;
						}

						return (
							<Task
								completed={ taskDefinition.completed }
								completedButtonText={ task.completedButtonText }
								completedTitle={ task.completedTitle }
								description={ task.description }
								duration={ task.duration }
								href={ task.getUrl( siteSlug ) }
								onClick={ this.handleTaskStart( {
									taskId: taskDefinition.id,
									tourId: get( task, 'tourId', null ),
								} ) }
								title={ task.title }
								key={ taskDefinition.id  }
								{ ...taskDefinition }
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
			taskStatuses: get( getSiteChecklist( state, siteId ), [ 'tasks' ], {} ),
		};
	},
	{
		recordTracksEvent,
		requestGuidedTour,
	}
)( localize( JetpackChecklist ) );
