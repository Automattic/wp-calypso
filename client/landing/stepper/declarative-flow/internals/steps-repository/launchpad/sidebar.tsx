import { Gridicon, CircularProgressBar } from '@automattic/components';
import { OnboardSelect, useLaunchpad } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useRef, useState } from '@wordpress/element';
import { Icon, copy } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { useLaunchpadChecklist } from 'calypso/../packages/help-center/src/hooks/use-launchpad-checklist';
import { StepNavigationLink } from 'calypso/../packages/onboarding/src';
import Badge from 'calypso/components/badge';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Tooltip from 'calypso/components/tooltip';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import Checklist from './checklist';
import { getArrayOfFilteredTasks, getEnhancedTasks } from './task-helper';
import { tasks } from './tasks';
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

const Sidebar = ( { sidebarDomain, siteSlug, submit, goNext, goToStep, flow }: SidebarProps ) => {
	let siteName = '';
	let topLevelDomain = '';
	let showClipboardButton = false;
	let isDomainSSLProcessing: boolean | null = false;
	const translate = useTranslate();
	const site = useSite();
	const clipboardButtonEl = useRef< HTMLButtonElement >( null );
	const [ clipboardCopied, setClipboardCopied ] = useState( false );

	const { globalStylesInUse, shouldLimitGlobalStyles } = usePremiumGlobalStyles( site?.ID );

	const {
		data: { site_intent: siteIntentOption, checklist_statuses: checklistStatuses },
	} = useLaunchpad( siteSlug );

	const { getDomainCartItem } = useSelect(
		( select ) => ( {
			getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
		} ),
		[]
	);

	const {
		data: { checklist: launchpadChecklist },
		isFetchedAfterMount,
	} = useLaunchpadChecklist( siteSlug, siteIntentOption );

	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	const { title, launchTitle, subtitle } = getLaunchpadTranslations( flow );

	const { getPlanCartItem } = useSelect(
		( select ) => ( {
			getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
		} ),
		[]
	);

	const startWritingFlowTasks: Task[] | null = getArrayOfFilteredTasks(
		tasks,
		flow,
		isEmailVerified
	);

	const enhancedTasks: Task[] | null =
		site &&
		getEnhancedTasks(
			flow === 'start-writing' ? startWritingFlowTasks : launchpadChecklist,
			siteSlug,
			site,
			submit,
			globalStylesInUse && shouldLimitGlobalStyles,
			goToStep,
			flow,
			isEmailVerified,
			checklistStatuses,
			getPlanCartItem()?.product_slug ?? null
		);

	const currentTask = enhancedTasks?.filter( ( task ) => task.completed ).length;
	const launchTask = enhancedTasks?.find( ( task ) => task.isLaunchTask === true );

	const showLaunchTitle = launchTask && ! launchTask.disabled;
	const domainUpgradeBadgeUrl = ! site?.plan?.is_free
		? `/domains/manage/${ siteSlug }`
		: `/domains/add/${ siteSlug }?domainAndPlanPackage=true`;
	const showDomainUpgradeBadge =
		sidebarDomain?.isWPCOMDomain &&
		! enhancedTasks?.find( ( task ) => task.id === 'domain_upsell' );

	if ( sidebarDomain ) {
		const { domain, isPrimary, isWPCOMDomain, sslStatus } = sidebarDomain;

		[ siteName, topLevelDomain ] = getUrlInfo( domain );

		isDomainSSLProcessing = sslStatus && sslStatus !== 'active';
		showClipboardButton = isWPCOMDomain ? true : ! isDomainSSLProcessing && isPrimary;
	}

	function getDomainName() {
		const domainInCart = getDomainCartItem();
		if ( domainInCart ) {
			return (
				<span className="launchpad__url-box-top-level-domain">
					{ domainInCart?.is_domain_registration ? domainInCart?.meta : domainInCart?.meta.domain }
				</span>
			);
		}

		return (
			<>
				<span>{ siteName }</span>
				<span className="launchpad__url-box-top-level-domain">{ topLevelDomain }</span>
			</>
		);
	}

	return (
		<div className="launchpad__sidebar">
			<div className="launchpad__sidebar-content-container">
				<div className="launchpad__progress-bar-container">
					<CircularProgressBar
						size={ 40 }
						enableDesktopScaling
						currentStep={ currentTask || null }
						numberOfSteps={ enhancedTasks?.length || null }
					/>
				</div>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace*/ }
				<h1 className="launchpad__sidebar-h1">
					{ showLaunchTitle && launchTitle ? launchTitle : title }
				</h1>
				<p className="launchpad__sidebar-description">{ subtitle }</p>
				<div className="launchpad__url-box">
					{ /* Google Chrome is adding an extra space after highlighted text. This extra wrapping div prevents that */ }
					<div className="launchpad__url-box-domain">
						<div className="launchpad__url-box-domain-text">{ getDomainName() }</div>
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
									<Icon icon={ copy } size={ 18 } />
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
						<div className="launchpad__domain-notification-icon">
							<Gridicon className="launchpad__domain-checkmark-icon" icon="checkmark" size={ 18 } />
						</div>
						<p>
							{ translate(
								'We are currently setting up your new domain!{{br/}}It may take a few minutes before it is ready.',
								{ components: { br: <br /> } }
							) }
						</p>
					</div>
				) }
				{ isFetchedAfterMount || flow === 'start-writing' ? (
					<Checklist tasks={ enhancedTasks } />
				) : (
					<Checklist.Placeholder />
				) }
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
