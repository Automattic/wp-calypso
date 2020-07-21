/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { Button } from '@automattic/components';
import Badge from 'components/badge';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const CurrentTaskItem = ( { currentTask, skipTask, startTask, setTaskIsManuallySelected } ) => {
	return (
		<div className="site-setup-list__task task">
			<div className="site-setup-list__task-text task__text">
				{ currentTask.isCompleted ? (
					<Badge type="info" className="site-setup-list__task-badge task__badge">
						{ translate( 'Complete' ) }
					</Badge>
				) : (
					<div className="site-setup-list__task-timing task__timing">
						<Gridicon icon="time" size={ 18 } />
						{ translate( '%d minute', '%d minutes', {
							count: currentTask.timing,
							args: [ currentTask.timing ],
						} ) }
					</div>
				) }
				<h2 className="site-setup-list__task-title task__title">{ currentTask.title }</h2>
				<p className="site-setup-list__task-description task__description">
					{ currentTask.description }
				</p>
				<div className="site-setup-list__task-actions task__actions">
					{ currentTask.actionText && (
						<Button
							className="site-setup-list__task-action task__action"
							primary
							onClick={ () => startTask() }
							disabled={
								currentTask.isDisabled ||
								( currentTask.isCompleted && currentTask.actionDisableOnComplete )
							}
						>
							{ currentTask.actionText }
						</Button>
					) }
					{ currentTask.isSkippable && ! currentTask.isCompleted && (
						<Button
							className="site-setup-list__task-skip task__skip is-link"
							onClick={ () => {
								setTaskIsManuallySelected( false );
								skipTask();
							} }
						>
							{ translate( 'Skip for now' ) }
						</Button>
					) }
				</div>
			</div>
		</div>
	);
};

export default CurrentTaskItem;
