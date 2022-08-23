import { ProgressBar } from '@automattic/components';
import { translate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useFlowParam } from 'calypso/landing/stepper/hooks/use-flow-param';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import Checklist from './checklist';
import { getArrayOfFilteredTasks } from './task-helper';
import { tasks } from './tasks';
import { Task } from './types';

function getChecklistCompletionProgress( tasks: Task[] ) {
	if ( ! tasks ) {
		return;
	}

	const totalCompletedTasks = tasks.reduce( ( total, currentTask ) => {
		return currentTask.isCompleted ? total + 1 : total;
	}, 0 );

	return Math.round( ( totalCompletedTasks / tasks.length ) * 100 );
}

const Sidebar = ( { siteSlug }: { siteSlug: string | null } ) => {
	const site = useSite();
	const url = site?.URL?.replace( /^https?:\/\//, '' );
	const flow = useFlowParam();
	const arrayOfFilteredTasks: Task[] | null = getArrayOfFilteredTasks( tasks, flow );

	const taskCompletionProgress =
		arrayOfFilteredTasks && getChecklistCompletionProgress( arrayOfFilteredTasks );

	return (
		<div className="launchpad__sidebar">
			<div className="launchpad__sidebar-header">
				<WordPressLogo className="launchpad__sidebar-header-logo" size={ 24 } />
				<span className="launchpad__sidebar-header-flow-name">Newsletter</span>
			</div>
			<div className="launchpad__sidebar-content-container">
				{ taskCompletionProgress && (
					<div className="launchpad__progress-bar-container">
						<span className="launchpad__progress-value">{ taskCompletionProgress }%</span>
						<ProgressBar
							className="launchpad__progress-bar"
							value={ taskCompletionProgress }
							title={ translate( 'Launchpad checklist progress bar' ) }
							compact={ true }
						/>
					</div>
				) }
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace*/ }
				<h1 className="launchpad__sidebar-h1">Voilà! Your Newsletter is up and running!</h1>
				<p className="launchpad__sidebar-description">
					Keep up the momentum with these next steps.
				</p>
				<div className="launchpad__url-box">{ url }</div>
				<Checklist siteSlug={ siteSlug } tasks={ tasks } flow={ flow } />
			</div>
		</div>
	);
};

export default Sidebar;
