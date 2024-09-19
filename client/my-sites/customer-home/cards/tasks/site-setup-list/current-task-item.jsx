import { Badge, Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';

const CurrentTaskItem = ( { currentTask, skipTask, startTask, useAccordionLayout } ) => {
	return (
		<div className="site-setup-list__task task" role="tabpanel">
			<div className="site-setup-list__task-text task__text">
				{ currentTask.isCompleted && ! currentTask.hideLabel && (
					<Badge type="info" className="site-setup-list__task-badge task__badge">
						{ translate( 'Complete' ) }
					</Badge>
				) }
				{ currentTask.timing && ! currentTask.isCompleted && (
					<div className="site-setup-list__task-timing task__timing">
						<Gridicon icon="time" size={ 18 } />
						{ translate( '%d minute', '%d minutes', {
							count: currentTask.timing,
							args: [ currentTask.timing ],
						} ) }
					</div>
				) }
				{ ! useAccordionLayout && (
					<>
						{ currentTask.icon }
						<h3 className="site-setup-list__task-title task__title">
							{ currentTask.subtitle || currentTask.title }
						</h3>
					</>
				) }
				<p className="site-setup-list__task-description task__description">
					{ currentTask.description }
				</p>
				<div className="site-setup-list__task-actions task__actions">
					{ currentTask.customFirstButton }
					{ currentTask.actionText && (
						<Button
							className={ clsx( 'site-setup-list__task-action', 'task__action', {
								'is-link': currentTask.actionIsLink,
								'is-jetpack-branded': currentTask.jetpackBranding,
							} ) }
							primary={ ! currentTask.actionIsLink }
							onClick={ () => startTask() }
							disabled={
								currentTask.isDisabled ||
								( currentTask.isCompleted && currentTask.actionDisableOnComplete )
							}
						>
							{ currentTask.isCompleted &&
								( currentTask.isDisabled || currentTask.actionDisableOnComplete ) && (
									<Gridicon
										aria-label={ translate( 'Task complete' ) }
										className="site-setup-list__complete-icon"
										icon="checkmark"
										size={ 18 }
									/>
								) }
							{ currentTask.actionText }
						</Button>
					) }
					{ currentTask.isSkippable && ! currentTask.isCompleted && (
						<Button
							className="site-setup-list__task-skip task__skip is-link"
							onClick={ () => skipTask() }
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
