import { Gridicon, CircularProgressBar } from '@automattic/components';
import { useRef, useState } from '@wordpress/element';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { StepNavigationLink } from 'calypso/../packages/onboarding/src';
import Badge from 'calypso/components/badge';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Tooltip from 'calypso/components/tooltip';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { useLaunchpad } from 'calypso/data/sites/use-launchpad';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import Checklist from './checklist';
import { getArrayOfFilteredTasks, getEnhancedTasks } from './task-helper';
import { DOMAIN_UPSELL, tasks } from './tasks';
import { getLaunchpadTranslations } from './translations';
import { Task } from './types';

type SidebarProps = {
	sidebarDomain: ResponseDomain;
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
	goToStep?: NavigationControls[ 'goToStep' ];
	flow: string | null;
};

function getUrlInfo( url: string ) {
	const urlWithoutProtocol = url.replace( /^https?:\/\//, '' );

	// Ex. mytest.wordpress.com matches mytest
	const siteName = urlWithoutProtocol.match( /^[^.]*/ )?.[ 0 ] || '';
	// Ex. mytest.wordpress.com matches .wordpress.com
	const topLevelDomain = urlWithoutProtocol.match( /\..*/ )?.[ 0 ] || '';

	return [ siteName, topLevelDomain ];
}

function getTasksProgress( tasks: Task[] | null ) {
	if ( ! tasks ) {
		return null;
	}

	const completedTasks = tasks.reduce( ( total, currentTask ) => {
		return currentTask.completed ? total + 1 : total;
	}, 0 );

	return completedTasks;
}

const Sidebar = ( { sidebarDomain, siteSlug, submit, goNext, goToStep, flow }: SidebarProps ) => {
	let siteName = '';
	let topLevelDomain = '';
	let showClipboardButton = false;
	let isDomainSSLProcessing: boolean | null = false;
	const translate = useTranslate();
	const site = useSite();
	const clipboardButtonEl = useRef< HTMLButtonElement >( null );
	const [ clipboardCopied, setClipboardCopied ] = useState( false );

	const { globalStylesInUse, shouldLimitGlobalStyles } = usePremiumGlobalStyles();
	const {
		data: { checklist_statuses },
	} = useLaunchpad( siteSlug );

	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	const { flowName, title, launchTitle, subtitle } = getLaunchpadTranslations( flow );

	const arrayOfFilteredTasks: Task[] | null = getArrayOfFilteredTasks(
		tasks,
		flow,
		isEmailVerified
	);

	const state = useSelector( ( state ) => state );

	const enhancedTasks: Task[] | null =
		site &&
		getEnhancedTasks(
			arrayOfFilteredTasks,
			siteSlug,
			site,
			submit,
			globalStylesInUse && shouldLimitGlobalStyles,
			goToStep,
			flow,
			isEmailVerified,
			checklist_statuses,
			state
		);

	const currentTask = getTasksProgress( enhancedTasks );
	const launchTask = enhancedTasks?.find( ( task ) => task.isLaunchTask === true );

	const showLaunchTitle = launchTask && ! launchTask.disabled;
	const domainUpgradeBadgeUrl = ! site?.plan?.is_free
		? `/domains/manage/${ siteSlug }`
		: `/domains/add/${ siteSlug }?domainAndPlanPackage=true`;
	const showDomainUpgradeBadge =
		sidebarDomain?.isWPCOMDomain && ! enhancedTasks?.find( ( task ) => task.id === DOMAIN_UPSELL );

	if ( sidebarDomain ) {
		const { domain, isPrimary, isWPCOMDomain, sslStatus } = sidebarDomain;

		[ siteName, topLevelDomain ] = getUrlInfo( domain );

		isDomainSSLProcessing = sslStatus && sslStatus !== 'active';
		showClipboardButton = isWPCOMDomain ? true : ! isDomainSSLProcessing && isPrimary;
	}

	return (
		<div className="launchpad__sidebar">
			<div className="launchpad__sidebar-header">
				<WordPressLogo className="launchpad__sidebar-header-logo" size={ 24 } />
				<span className="launchpad__sidebar-header-flow-name">{ flowName }</span>
			</div>
			<div className="launchpad__sidebar-content-container">
				{ currentTask && enhancedTasks?.length && (
					<div className="launchpad__progress-bar-container">
						<CircularProgressBar
							size={ 40 }
							enableDesktopScaling
							currentStep={ currentTask }
							numberOfSteps={ enhancedTasks?.length }
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
					<div className="launchpad__url-box-domain">
						<div className="launchpad__url-box-domain-text">
							<span>{ siteName }</span>
							<span className="launchpad__url-box-top-level-domain">{ topLevelDomain }</span>
						</div>
						{ showClipboardButton && (
							<>
								<ClipboardButton
									aria-label={ translate( 'Copy URL' ) }
									text={ siteSlug }
									className="launchpad__clipboard-button"
									borderless
									compact
									onCopy={ () => setClipboardCopied( true ) }
									onMouseLeave={ () => setClipboardCopied( false ) }
									ref={ clipboardButtonEl }
								>
									<Gridicon icon="clipboard" />
								</ClipboardButton>
								<Tooltip
									context={ clipboardButtonEl.current }
									isVisible={ clipboardCopied }
									position="top"
								>
									{ translate( 'Copied to clipboard!' ) }
								</Tooltip>
							</>
						) }
					</div>
					{ showDomainUpgradeBadge && (
						<a href={ domainUpgradeBadgeUrl }>
							<Badge className="launchpad__domain-upgrade-badge" type="info-blue">
								{ translate( 'Customize' ) }
							</Badge>
						</a>
					) }
				</div>
				{ isDomainSSLProcessing && (
					<div className="launchpad__domain-notification">
						<Gridicon className="launchpad__domain-checkmark-icon" icon="checkmark-circle" />
						<p>
							{ translate(
								'We are currently setting up your new domain! It may take a few minutes before it is ready.'
							) }
						</p>
					</div>
				) }
				<Checklist tasks={ enhancedTasks } />
			</div>
			<div className="launchpad__sidebar-admin-link">
				<StepNavigationLink
					direction="forward"
					handleClick={ () => {
						recordTracksEvent( 'calypso_launchpad_go_to_admin_clicked', { flow: flow } );
						goNext?.();
					} }
					label={ translate( 'Skip to dashboard' ) }
					borderless={ true }
				/>
			</div>
		</div>
	);
};

export default Sidebar;
