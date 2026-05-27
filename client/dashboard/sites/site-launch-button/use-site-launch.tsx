import { DotcomPlans } from '@automattic/api-core';
import { domainsQuery, siteLaunchMutation } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState, type ComponentType, type ReactElement } from 'react';
import { useExperiment } from 'calypso/lib/explat';
import { getCurrentDashboard } from '../../app/routing';
import { dashboardLinkWithBackport, redirectToDashboardLink, wpcomLink } from '../../utils/link';
import {
	isSitePlanLaunchable as getIsSitePlanLaunchable,
	isSitePlanBigSkyTrial,
	isSitePlanPaid,
} from '../plans';
import type { Site } from '@automattic/api-core';

export type A4aLaunchModalComponent = ComponentType< {
	isLaunching: boolean;
	onClose: () => void;
	onLaunch: () => void;
} >;

type RecordTracksEvent = ( eventName: string, properties?: Record< string, unknown > ) => void;

export interface UseSiteLaunchOptions {
	tracksContext: string;
	backTo?: string;
	a4aLaunchUrl?: string;
	a4aLaunchModal?: A4aLaunchModalComponent;
	// When true, any direct launch (immediate or ungated-experiment) also adds
	// `celebrateLaunch=true` to the URL so `SiteLaunchCelebrationModal` opens.
	// Defaults to false to preserve existing dashboard behavior where only the
	// ungated experiment variant triggers celebration.
	celebrateOnLaunch?: boolean;
	// Override the domains query (e.g. ciab passes `domainsQuery({ garden: 'commerce' })`).
	// Defaults to the bare `domainsQuery()`.
	domainsOptions?: ReturnType< typeof domainsQuery >;
	// Tracks recorder. Dashboard surfaces pass `useAnalytics().recordTracksEvent`;
	// the omnibar passes a standalone wrapper since it lives outside the dashboard's
	// AnalyticsProvider tree.
	recordTracksEvent: RecordTracksEvent;
}

export interface UseSiteLaunchResult {
	isLoading: boolean;
	isHidden: boolean;
	isDisabled: boolean;
	isBusy: boolean;
	href?: string;
	onClick: () => void;
	modal: ReactElement | null;
}

const EXPERIMENT_NAME = 'calypso_standardized_site_launch_gating_202603_v1';

export function useSiteLaunch(
	site: Site,
	{
		tracksContext,
		backTo,
		a4aLaunchUrl,
		a4aLaunchModal: A4aLaunchModal,
		celebrateOnLaunch = false,
		domainsOptions,
		recordTracksEvent,
	}: UseSiteLaunchOptions
): UseSiteLaunchResult {
	const { data: domains = [], isLoading: isDomainsLoading } = useQuery( {
		...( domainsOptions ?? domainsQuery() ),
		select: ( data ) => data.filter( ( d ) => d.blog_id === site.ID ),
	} );

	const launchMutation = useMutation( {
		...siteLaunchMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Your site has been launched; now you can share it with the world!' ),
				error: __( 'Failed to launch site' ),
			},
		},
	} );

	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ isExperimentLoading, experiment ] = useExperiment( EXPERIMENT_NAME );
	const variant = experiment?.variationName;

	const isSitePlanHostingTrial = site.plan?.product_slug === DotcomPlans.HOSTING_TRIAL_MONTHLY;
	const isSitePlanPaidWithDomains = isSitePlanPaid( site ) && domains.length > 1;
	const isDisabled = ! getIsSitePlanLaunchable( site );
	const shouldImmediatelyLaunch =
		isSitePlanPaidWithDomains || isSitePlanHostingTrial || site.is_wpcom_staging_site;

	const getLaunchUrl = () => {
		if ( isSitePlanBigSkyTrial( site ) ) {
			return addQueryArgs( wpcomLink( '/setup/ai-site-builder/domains' ), {
				siteId: site.ID,
				source: 'general-settings',
				redirect: 'site-launch',
				new: site.name,
				search: 'yes',
			} );
		}

		return addQueryArgs( wpcomLink( '/start/launch-site' ), {
			siteSlug: site.slug,
			new: site.name,
			hide_initial_query: 'yes',
			back_to: backTo
				? dashboardLinkWithBackport( backTo )
				: redirectToDashboardLink( { supportBackport: true } ),
			dashboard: getCurrentDashboard(),
		} );
	};

	const track = () => {
		recordTracksEvent( 'calypso_dashboard_site_launch_button_click', { context: tracksContext } );
	};

	const launchDirectly = ( { withCelebration }: { withCelebration: boolean } ) => {
		launchMutation.mutate( undefined, {
			onSuccess: withCelebration
				? () => {
						window.history.replaceState(
							null,
							'',
							addQueryArgs( window.location.href, { celebrateLaunch: 'true' } )
						);
				  }
				: undefined,
		} );
	};

	const launchForModal = () => {
		track();
		launchMutation.mutate( undefined, {
			onSettled: () => setIsModalOpen( false ),
		} );
	};

	const baseResult = {
		isLoading: isDomainsLoading || isExperimentLoading,
		isDisabled,
		isBusy: launchMutation.isPending,
		modal: null as ReactElement | null,
	};

	if ( site.is_a4a_dev_site ) {
		if ( a4aLaunchUrl ) {
			return {
				...baseResult,
				isHidden: false,
				href: a4aLaunchUrl,
				onClick: track,
			};
		}

		if ( A4aLaunchModal ) {
			return {
				...baseResult,
				isHidden: false,
				onClick: () => setIsModalOpen( true ),
				modal: isModalOpen ? (
					<A4aLaunchModal
						isLaunching={ launchMutation.isPending }
						onClose={ () => setIsModalOpen( false ) }
						onLaunch={ launchForModal }
					/>
				) : null,
			};
		}

		return { ...baseResult, isHidden: true, onClick: () => {} };
	}

	if ( variant === 'semi_gated_site_launch' ) {
		return {
			...baseResult,
			isHidden: false,
			onClick: () => {
				track();
				window.location.assign( getLaunchUrl() );
			},
		};
	}

	if ( variant === 'ungated_site_launch' ) {
		return {
			...baseResult,
			isHidden: false,
			onClick: () => {
				track();
				// The ungated experiment has always triggered celebration; keep that
				// behavior regardless of the celebrateOnLaunch option.
				launchDirectly( { withCelebration: true } );
			},
		};
	}

	if ( shouldImmediatelyLaunch ) {
		return {
			...baseResult,
			isHidden: false,
			onClick: () => {
				track();
				launchDirectly( { withCelebration: celebrateOnLaunch } );
			},
		};
	}

	return {
		...baseResult,
		isHidden: false,
		href: getLaunchUrl(),
		onClick: track,
	};
}
