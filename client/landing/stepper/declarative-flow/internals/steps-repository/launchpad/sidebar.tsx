import { PLAN_PREMIUM } from '@automattic/calypso-products';
import { Badge, CircularProgressBar, Dialog, Gridicon } from '@automattic/components';
import { OnboardSelect, useLaunchpad } from '@automattic/data-stores';
import { Launchpad } from '@automattic/launchpad';
import { isBlogOnboardingFlow, isNewsletterFlow } from '@automattic/onboarding';
import { useQueryClient } from '@tanstack/react-query';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
import { copy, Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import ClipboardButton from 'calypso/components/forms/clipboard-button';
import Tooltip from 'calypso/components/tooltip';
import { useDomainEmailVerification } from 'calypso/data/domains/use-domain-email-verfication';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { ResponseDomain } from 'calypso/lib/domains/types';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
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

type MembershipsData = {
	connect_url: string | undefined;
	connected_account_default_currency: string | undefined;
	connected_account_description: string | undefined;
	connected_account_id: string | undefined;
};

function getUrlInfo( url: string ) {
	const urlWithoutProtocol = url.replace( /^https?:\/\//, '' );

	// Ex. mytest.wordpress.com matches mytest
	const siteName = urlWithoutProtocol.match( /^[^.]*/ )?.[ 0 ] || '';
	// Ex. mytest.wordpress.com matches .wordpress.com
	const topLevelDomain = urlWithoutProtocol.match( /\..*/ )?.[ 0 ] || '';

	return [ siteName, topLevelDomain ];
}

function fetchMembershipsData( siteId: number ): Promise< MembershipsData > {
	const url = `/sites/${ siteId }/memberships/status?source=launchpad`;
	return wpcom.req.get( url, { apiNamespace: 'wpcom/v2' } );
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
	const [ stripeConnectUrl, setStripeConnectUrl ] = useState< string >( '' );
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

	const { getPlanCartItem, getDomainCartItem } = useSelect(
		( select ) => ( {
			getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
			getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
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
			queryClient,
			flow,
			isEmailVerified,
			checklistStatuses,
			() => setShowConfirmModal( true ),
			goToStep,
			getPlanCartItem(),
			getDomainCartItem(),
			stripeConnectUrl,
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

	useEffect( () => {
		if ( site?.ID && isNewsletterFlow( flow ) ) {
			fetchMembershipsData( site.ID ).then( ( { connect_url } ) => {
				setStripeConnectUrl( connect_url || '' );
			} );
		}
	}, [ site, flow ] );

	return (
		<>
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
					<Launchpad
						siteSlug={ siteSlug }
						taskFilter={ () => enhancedTasks || [] }
						makeLastTaskPrimaryAction={ true }
					/>
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
