import { Button, ProgressBar } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { StepNavigationLink } from 'calypso/../packages/onboarding/src';
import Badge from 'calypso/components/badge';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useFlowParam } from 'calypso/landing/stepper/hooks/use-flow-param';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import Checklist from './checklist';
import { getArrayOfFilteredTasks, getEnhancedTasks, isTaskDisabled } from './task-helper';
import { tasks } from './tasks';
import { getLaunchpadTranslations } from './translations';
import { Task } from './types';

type SidebarProps = {
	sidebarURL: string | null;
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
	goToStep?: NavigationControls[ 'goToStep' ];
};

function upgradeDomain( siteSlug: null ) {
	window.location.href = `/domains/add/${ siteSlug }`;
}

function getUrlInfo( url: string ) {
	const urlWithoutProtocol = url.replace( /^https?:\/\//, '' );

	// Ex. mytest.wordpress.com matches mytest
	const siteName = urlWithoutProtocol.match( /^[^.]*/ );
	// Ex. mytest.wordpress.com matches .wordpress.com
	const topLevelDomain = urlWithoutProtocol.match( /\..*/ ) || [];

	return [ siteName ? siteName[ 0 ] : '', topLevelDomain ? topLevelDomain[ 0 ] : '' ];
}

function getChecklistCompletionProgress( tasks: Task[] | null ) {
	if ( ! tasks ) {
		return;
	}

	const totalCompletedTasks = tasks.reduce( ( total, currentTask ) => {
		return currentTask.isCompleted ? total + 1 : total;
	}, 0 );

	return Math.round( ( totalCompletedTasks / tasks.length ) * 100 );
}

const Sidebar = ( { sidebarURL, siteSlug, submit, goNext, goToStep }: SidebarProps ) => {
	let siteName = '';
	let topLevelDomain = '';
	const flow = useFlowParam();
	const translate = useTranslate();
	const site = useSite();
	const { flowName, title, launchTitle, subtitle } = getLaunchpadTranslations( flow );
	const arrayOfFilteredTasks: Task[] | null = getArrayOfFilteredTasks( tasks, flow );
	const enhancedTasks =
		site && getEnhancedTasks( arrayOfFilteredTasks, siteSlug, site, submit, goToStep, flow );

	const taskCompletionProgress = site && getChecklistCompletionProgress( enhancedTasks );
	const launchTask = enhancedTasks?.find( ( task ) => task.isLaunchTask === true );
	const showLaunchTitle = launchTask && ! isTaskDisabled( launchTask );

	if ( sidebarURL ) {
		[ siteName, topLevelDomain ] = getUrlInfo( sidebarURL );
	}

	return (
		<div className="launchpad__sidebar">
			<div className="launchpad__sidebar-header">
				<WordPressLogo className="launchpad__sidebar-header-logo" size={ 24 } />
				<span className="launchpad__sidebar-header-flow-name">{ flowName }</span>
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
				<h1 className="launchpad__sidebar-h1">
					{ showLaunchTitle && launchTitle ? launchTitle : title }
				</h1>
				<p className="launchpad__sidebar-description">{ subtitle }</p>
				<div className="launchpad__url-box">
					{ /* Google Chrome is adding an extra space after highlighted text. This extra wrapping div prevents that */ }
					<div className="launchpad__url-box-domain-text">
						<span>{ siteName }</span>
						<span className="launchpad__url-box-top-level-domain">{ topLevelDomain }</span>
					</div>
					{ true && (
						<Button
							className="launchpad__domain-upgrade-badge-button"
							onClick={ () => upgradeDomain( siteSlug ) }
						>
							<Badge className="launchpad__domain-upgrade-badge" type="info-blue">
								{ translate( 'Customize' ) }
							</Badge>
						</Button>
					) }
				</div>
				<Checklist tasks={ enhancedTasks } />
			</div>
			<div className="launchpad__sidebar-admin-link">
				<StepNavigationLink
					direction="forward"
					handleClick={ () => {
						recordTracksEvent( 'calypso_launchpad_go_to_admin_clicked', { flow: flow } );
						goNext();
					} }
					label={ translate( 'Go to Admin' ) }
					borderless={ true }
				/>
			</div>
		</div>
	);
};

export default Sidebar;
