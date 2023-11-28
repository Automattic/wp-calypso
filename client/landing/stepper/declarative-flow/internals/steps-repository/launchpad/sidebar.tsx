import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { Badge, CircularProgressBar, Dialog, Gridicon } from '@automattic/components';
import { OnboardSelect, useLaunchpad } from '@automattic/data-stores';
import { LaunchpadInternal } from '@automattic/launchpad';
import { isBlogOnboardingFlow } from '@automattic/onboarding';
import { useQueryClient } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { useRef, useState } from '@wordpress/element';
import { copy, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Tooltip from 'calypso/components/tooltip';
import { useDomainEmailVerification } from 'calypso/data/domains/use-domain-email-verfication';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ResponseDomain } from 'calypso/lib/domains/types';
import RecurringPaymentsPlanAddEditModal from 'calypso/my-sites/earn/components/add-edit-plan-modal';
import { TYPE_TIER } from 'calypso/my-sites/earn/memberships/constants';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { getConnectUrlForSiteId } from 'calypso/state/memberships/settings/selectors';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getEnhancedTasks } from './task-helper';
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

function recordUnverifiedDomainDialogShownTracksEvent( site_id?: number ) {
	recordTracksEvent( 'calypso_launchpad_unverified_domain_email_dialog_shown', {
		site_id,
	} );
}

function recordUnverifiedDomainContinueAnywayClickedTracksEvent( site_id?: number ) {
	recordTracksEvent( 'calypso_launchpad_unverified_domain_email_continue_anyway_clicked', {
		site_id,
	} );
}

const Sidebar = ( { sidebarDomain, siteSlug, submit, goToStep, flow }: SidebarProps ) => {
	let siteName = '';
	let topLevelDomain = '';
	let showClipboardButton = false;
	let isDomainSSLProcessing: boolean | null = false;
	const translate = useTranslate();
	const site = useSite();
	const siteIntentOption = site?.options?.site_intent ?? null;
	const clipboardButtonEl = useRef< HTMLButtonElement >( null );
	const [ clipboardCopied, setClipboardCopied ] = useState( false );
	const [ showPlansModal, setShowPlansModal ] = useState( false );
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const queryClient = useQueryClient();

	const { globalStylesInUse, shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( site?.ID );

	const {
		data: { checklist_statuses: checklistStatuses, checklist: launchpadChecklist },
	} = useLaunchpad( siteSlug, siteIntentOption );

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

	const { isEmailUnverified: isDomainEmailUnverified } = useDomainEmailVerification(
		site?.ID,
		siteSlug ?? '',
		selectedDomain?.domain_name ?? sidebarDomain?.domain
	);

	const isEmailVerified = useSelector( isCurrentUserEmailVerified );

	const { title, launchTitle, subtitle } = getLaunchpadTranslations( flow );

	const { planCartItem, domainCartItem, productCartItems } = useSelect(
		( select ) => ( {
			planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
			productCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getProductCartItems(),
		} ),
		[]
	);

	const enhancedTasks: Task[] | null =
		site &&
		getEnhancedTasks(
			launchpadChecklist,
			siteSlug,
			site,
			submit,
			globalStylesInUse && shouldLimitGlobalStyles,
			PLAN_PREMIUM,
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
			() => {
				recordUnverifiedDomainDialogShownTracksEvent( site?.ID );
				setShowConfirmModal( true );
			},
			isDomainEmailUnverified
		);

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
			<div className="launchpad__sidebar">
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
										{ translate( 'Customize' ) }
									</Badge>
								</a>
							) }
						</div>
					) }
					{ isDomainSSLProcessing && (
						<div className="launchpad__domain-notification">
							<div className="launchpad__domain-notification-icon">
								<Gridicon
									className="launchpad__domain-checkmark-icon"
									icon="checkmark"
									size={ 18 }
								/>
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
						siteSlug={ siteSlug }
						taskFilter={ () => enhancedTasks || [] }
						makeLastTaskPrimaryAction={ true }
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
			</div>
			<Dialog
				isVisible={ showConfirmModal }
				buttons={ [
					{
						action: 'cancel',
						label: translate( 'Cancel' ),
					},
					{
						action: 'launch',
						label: translate( 'Continue anyway' ),
						isPrimary: true,
						onClick: () => {
							recordUnverifiedDomainContinueAnywayClickedTracksEvent( site?.ID );
							enhancedTasks?.find( ( task ) => task.isLaunchTask )?.actionDispatch?.( true );
							setShowConfirmModal( false );
						},
					},
				] }
				onClose={ () => setShowConfirmModal( false ) }
			>
				<p>
					{ translate(
						'Your domain email address is still unverified. This will cause {{strong}}%(domain)s{{/strong}} to be suspended in the future.{{break/}}{{break/}}Please check your inbox for the ICANN verification email.',
						{
							components: {
								p: <p />,
								break: <br />,
								strong: <strong />,
							},
							args: { domain: sidebarDomain?.domain },
						}
					) }
				</p>
			</Dialog>
		</>
	);
};

export default Sidebar;
