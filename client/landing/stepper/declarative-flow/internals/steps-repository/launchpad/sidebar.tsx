import { ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useFlowParam } from 'calypso/landing/stepper/hooks/use-flow-param';
import Checklist from './checklist';
import { getArrayOfFilteredTasks } from './task-helper';
import { tasks } from './tasks';
import { getLaunchpadTranslations } from './translations';
import { Task } from './types';

type SidebarProps = {
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
};

function getUrlInfo( url: string ) {
	const urlWithoutProtocol = url.replace( /^https?:\/\//, '' );

	// Ex. mytest.wordpress.com matches mytest
	const siteName = urlWithoutProtocol.match( /^[^.]*/ );
	// Ex. mytest.wordpress.com matches .wordpress.com
	const topLevelDomain = urlWithoutProtocol.match( /\..*/ ) || [];

	return [ siteName ? siteName[ 0 ] : '', topLevelDomain ? topLevelDomain[ 0 ] : '' ];
}

function getChecklistCompletionProgress( tasks: Task[] ) {
	if ( ! tasks ) {
		return;
	}

	const totalCompletedTasks = tasks.reduce( ( total, currentTask ) => {
		return currentTask.isCompleted ? total + 1 : total;
	}, 0 );

	return Math.round( ( totalCompletedTasks / tasks.length ) * 100 );
}

const Sidebar = ( { siteSlug, submit }: SidebarProps ) => {
	let siteName = '';
	let topLevelDomain = '';
	const flow = useFlowParam();
	const translate = useTranslate();
	const translatedStrings = getLaunchpadTranslations( flow );
	const arrayOfFilteredTasks: Task[] | null = getArrayOfFilteredTasks( tasks, flow );
	const taskCompletionProgress =
		arrayOfFilteredTasks && getChecklistCompletionProgress( arrayOfFilteredTasks );

	if ( siteSlug ) {
		[ siteName, topLevelDomain ] = getUrlInfo( siteSlug );
	}

	return (
		<div className="launchpad__sidebar">
			<div className="launchpad__sidebar-header">
				<WordPressLogo className="launchpad__sidebar-header-logo" size={ 24 } />
				<span className="launchpad__sidebar-header-flow-name">{ translatedStrings.flowName }</span>
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
				<h1 className="launchpad__sidebar-h1">{ translatedStrings.sidebarTitle }</h1>
				<p className="launchpad__sidebar-description">{ translatedStrings.sidebarSubtitle }</p>
				<div className="launchpad__url-box">
					<span>{ siteName }</span>
					<span className="launchpad__url-box-top-level-domain">{ topLevelDomain }</span>
				</div>
				<Checklist siteSlug={ siteSlug } tasks={ tasks } flow={ flow } submit={ submit } />
			</div>
		</div>
	);
};

export default Sidebar;
