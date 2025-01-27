import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { Badge, CircularProgressBar, Gridicon, Tooltip } from '@automattic/components';
import {
	OnboardSelect,
	sortLaunchpadTasksByCompletionStatus,
	useLaunchpad,
} from '@automattic/data-stores';
import { LaunchpadInternal, type Task } from '@automattic/launchpad';
import { isBlogOnboardingFlow } from '@automattic/onboarding';
import { useQueryClient } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { useRef, useState } from '@wordpress/element';
import { copy, Icon } from '@wordpress/icons';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import { type NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { type ResponseDomain } from 'calypso/lib/domains/types';
import RecurringPaymentsPlanAddEditModal from 'calypso/my-sites/earn/components/add-edit-plan-modal';
import { TYPE_TIER } from 'calypso/my-sites/earn/memberships/constants';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { getConnectUrlForSiteId } from 'calypso/state/memberships/settings/selectors';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getEnhancedTasks } from './task-definitions';
import { getLaunchpadTranslations } from './translations';

type SidebarProps = {
	sidebarDomain: ResponseDomain;
	launchpadKey: string;
	siteSlug: string | null;
	submit: NavigationControls[ 'submit' ];
	goNext: NavigationControls[ 'goNext' ];
	goToStep?: NavigationControls[ 'goToStep' ];
	flow: string;
};

function getUrlInfo( url: string ) {
	const urlWithoutProtocol = url.replace( /^https?:\/\//, '' );

	// Ex. mytest.wordpress.com matches mytest
	const siteName = urlWithoutProtocol.match( /^[^.]*/ )?.[ 0 ] || '';
	// Ex. mytest.wordpress.com matches .wordpress.com
	const topLevelDomain = urlWithoutProtocol.match( /\..*/ )?.[ 0 ] || '';

	return [ siteName, topLevelDomain ];
}

const Sidebar = ( {
	sidebarDomain,
	launchpadKey,
	siteSlug,
	submit,
	goToStep,
	flow,
}: SidebarProps ) => {
	let siteName = '';
	let topLevelDomain = '';
	let showClipboardButton = false;
	let isDomainSSLProcessing: boolean | null = false;
	const translate = useTranslate();
	const site = useSite();
	const siteIntentOption = site?.options?.site_intent ?? null;
	const checklistSlug = siteIntentOption;
	const clipboardButtonEl = useRef< HTMLButtonElement >( null );
	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const [ showPlansModal, setShowPlansModal ] = useState( false );
	const queryClient = useQueryClient();
	const hasSkippedCheckout = Boolean( getQueryArg( window.location.href, 'skippedCheckout' ) );
	const { globalStylesInUse, shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( site?.ID );

	const {
		data: { checklist_statuses: checklistStatuses, checklist: launchpadChecklist },
	} = useLaunchpad( launchpadKey, siteIntentOption, {
		onSuccess: sortLaunchpadTasksByCompletionStatus,
	} );

	const selectedDomain = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
		[]
	);

	const stripeConnectUrl = useSelector( ( state ) =>
		getConnectUrlForSiteId( state, site?.ID ?? 0 )
	);

	const showDomain =
		! isBlogOnboardingFlow( flow ) ||
		( checklistStatuses?.domain_upsell_deferred === true && selectedDomain );

	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	const { title, launchTitle, subtitle } = getLaunchpadTranslations( flow, hasSkippedCheckout );

	const { planCartItem, domainCartItem, productCartItems, selectedDesign } = useSelect(
		( select ) => ( {
			planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
			productCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getProductCartItems(),
			selectedDesign: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		} ),
		[]
	);

	const displayGlobalStylesWarning = globalStylesInUse && shouldLimitGlobalStyles;

	let checklist = launchpadChecklist;
	if ( selectedDesign?.default ) {
		checklist = ( launchpadChecklist ?? [] ).map( ( task ) => {
			if ( task.id === 'design_selected' ) {
				return { ...task, completed: false };
			}
			return task;
		} );
	}

	const enhancedTasks: Task[] | null = useMemo( () => {
		if ( ! site ) {
			return null;
		}

		return getEnhancedTasks( {
			tasks: checklist,
			siteSlug,
			site,
			submit,
			displayGlobalStylesWarning,
			globalStylesMinimumPlan: PLAN_PREMIUM,
			setShowPlansModal,
			queryClient,
			goToStep,
			flow,
			isEmailVerified,
			checklistStatuses,
			planCartItem,
			domainCartItem,
			productCartItems,
			stripeConnectUrl,
			hasSkippedCheckout,
		} );
	}, [
		site,
		launchpadChecklist,
		siteSlug,
		submit,
		displayGlobalStylesWarning,
		setShowPlansModal,
		queryClient,
		goToStep,
		flow,
		isEmailVerified,
		checklistStatuses,
		planCartItem,
		domainCartItem,
		productCartItems,
		stripeConnectUrl,
	] );

	const currentTask = enhancedTasks?.filter( ( task ) => task.completed ).length;
	const launchTask = enhancedTasks?.find( ( task ) => task.isLaunchTask === true );

	const showLaunchTitle = launchTask && ! launchTask.disabled;

	function getDomainUpgradeBadgeUrl() {
		if ( isBlogOnboardingFlow( siteIntentOption ) ) {
			return `/setup/${ siteIntentOption }/domains?siteSlug=${ selectedDomain?.domain_name }&domainAndPlanPackage=true`;
		}
		return ! site?.plan?.is_free
			? `/domains/manage/${ siteSlug }`
			: `/domains/add/${ siteSlug }?domainAndPlanPackage=true`;
	}

	function showDomainUpgradeBadge() {
		if ( isBlogOnboardingFlow( siteIntentOption ) ) {
			return selectedDomain?.is_free;
		}

		return (
			sidebarDomain?.isWPCOMDomain &&
			! enhancedTasks?.find( ( task ) => task.id === 'domain_upsell' )
		);
	}

	if ( sidebarDomain ) {
		const { domain, isPrimary, isWPCOMDomain, sslStatus } = sidebarDomain;

		[ siteName, topLevelDomain ] = getUrlInfo( domain );

		isDomainSSLProcessing = sslStatus && sslStatus !== 'active';
		showClipboardButton = isWPCOMDomain ? true : ! isDomainSSLProcessing && isPrimary;
	}

	function getDomainName() {
		if ( selectedDomain ) {
			return (
				<span className="launchpad__url-box-top-level-domain">{ selectedDomain.domain_name }</span>
			);
		}

		return (
			<>
				<span>{ siteName }</span>
				<span className="launchpad__url-box-top-level-domain">{ topLevelDomain }</span>
			</>
		);
	}

	// If there is no site yet then we set 1 as numberOfSteps so the CircularProgressBar gets rendered in
	// an empty state. If site is here then we default to the previous behaviour: show it if enhancedTasks.length > 0.
	const numberOfSteps = site === null ? 1 : enhancedTasks?.length || null;
	return (
		<>
			{ site && <QueryMembershipsSettings siteId={ site.ID } source="launchpad" /> }
			<div className="launchpad__sidebar-content-container">
				<div className="launchpad__progress-bar-container">
					<CircularProgressBar
						size={ 40 }
						enableDesktopScaling
						currentStep={ currentTask || 0 }
						numberOfSteps={ numberOfSteps }
						showProgressText={ site !== null }
					/>
				</div>
				{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace*/ }
				<h1 className="launchpad__sidebar-h1">
					{ showLaunchTitle && launchTitle ? launchTitle : title }
				</h1>
				<p className="launchpad__sidebar-description">{ subtitle }</p>
				{ showDomain && (
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
						{ showDomainUpgradeBadge() && (
							<a href={ getDomainUpgradeBadgeUrl() }>
								<Badge className="launchpad__domain-upgrade-badge" type="info-blue">
									{ translate( 'Pick a custom domain' ) }
								</Badge>
							</a>
						) }
					</div>
				) }
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
				<LaunchpadInternal
					flow={ flow }
					site={ site }
					siteSlug={ launchpadKey }
					checklistSlug={ checklistSlug }
					taskFilter={ () => enhancedTasks || [] }
					launchpadContext="onboarding"
					makeLastTaskPrimaryAction
				/>
				{ showPlansModal && site?.ID && (
					<RecurringPaymentsPlanAddEditModal
						closeDialog={ () => setShowPlansModal( false ) }
						product={ {
							price: 5,
							subscribe_as_site_subscriber: true,
							title: translate( 'Paid newsletter' ),
							type: TYPE_TIER,
						} }
						annualProduct={ {
							price: 5 * 12,
							subscribe_as_site_subscriber: true,
							title: `${ translate( 'Paid newsletter' ) } ${ translate( '(yearly)' ) }`,
						} }
						siteId={ site.ID }
					/>
				) }
			</div>
		</>
	);
};

export default Sidebar;
