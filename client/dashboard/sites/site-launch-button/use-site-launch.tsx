import { DotcomPlans } from '@automattic/api-core';
import { domainsQuery, siteLaunchMutation } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useMemo, useState, type ComponentType, type ReactElement } from 'react';
import { useSiteLaunchGatingVariant } from 'calypso/lib/use-site-launch-gating-variant';
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
	postLaunchUrl?: string;
	a4aLaunchUrl?: string;
	a4aLaunchModal?: A4aLaunchModalComponent;
	domainsOptions?: ReturnType< typeof domainsQuery >;
	recordTracksEvent: RecordTracksEvent;
	onLaunchError?: () => void;
}

export interface UseSiteLaunchResult {
	isLoading: boolean;
	isExperimentLoading: boolean;
	isHidden: boolean;
	isDisabled: boolean;
	isBusy: boolean;
	href?: string;
	onClick: () => void;
	modal: ReactElement | null;
}

export function useSiteLaunch(
	site: Site,
	{
		tracksContext,
		backTo,
		postLaunchUrl,
		a4aLaunchUrl,
		a4aLaunchModal: A4aLaunchModal,
		domainsOptions,
		recordTracksEvent,
		onLaunchError,
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
				error: __( 'Failed to launch site.' ),
			},
		},
	} );

	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [ isExperimentLoading, variant ] = useSiteLaunchGatingVariant();

	const isSitePlanHostingTrial = site.plan?.product_slug === DotcomPlans.HOSTING_TRIAL_MONTHLY;
	const isSitePlanPaidWithDomains = isSitePlanPaid( site ) && domains.length > 1;
	const isDisabled = ! getIsSitePlanLaunchable( site );
	const shouldImmediatelyLaunch =
		isSitePlanPaidWithDomains || isSitePlanHostingTrial || site.is_wpcom_staging_site;

	const launchUrl = useMemo( () => {
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
	}, [ site, backTo ] );

	const track = () => {
		recordTracksEvent( 'calypso_dashboard_site_launch_button_click', { context: tracksContext } );
	};

	const redirectAfterLaunch = ( options: { celebrate?: boolean } = {} ) => {
		const targetUrl = addQueryArgs( postLaunchUrl ?? window.location.href, {
			...( options.celebrate ? { celebrateLaunch: 'true' } : {} ),
		} );

		if ( postLaunchUrl ) {
			window.location.assign( targetUrl );
			return;
		}

		window.history.replaceState( null, '', targetUrl );
	};

	const launchForModal = () => {
		track();
		launchMutation.mutate( undefined, {
			onError: onLaunchError,
			onSettled: () => setIsModalOpen( false ),
		} );
	};

	const baseResult = {
		isLoading: isDomainsLoading,
		isExperimentLoading,
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

	if ( shouldImmediatelyLaunch ) {
		return {
			...baseResult,
			isHidden: false,
			onClick: () => {
				track();
				launchMutation.mutate( undefined, {
					onSuccess: () => redirectAfterLaunch(),
					onError: onLaunchError,
				} );
			},
		};
	}

	// Site launch gating: 'semi_gated_site_launch' is the shipped default.
	// The other branches are scaffolding for future experiments; see
	// useSiteLaunchGatingVariant().
	switch ( variant ) {
		case 'semi_gated_site_launch':
		case null:
		default:
			return {
				...baseResult,
				isHidden: false,
				href: launchUrl,
				onClick: track,
			};
	}
}
