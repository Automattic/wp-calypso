import { DotcomPlans } from '@automattic/api-core';
import { siteDomainsQuery, siteLaunchMutation } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import {
	isSitePlanLaunchable as getIsSitePlanLaunchable,
	isSitePlanBigSkyTrial,
	isSitePlanPaid,
} from '../plans';
import AgencyDevelopmentSiteLaunchModal from './agency-development-site-launch-modal';
import type { Site } from '@automattic/api-core';

export function SiteLaunchButton( { site, tracksContext }: { site: Site; tracksContext: string } ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: domains = [], isLoading } = useQuery( siteDomainsQuery( site.ID ) );
	const launchMutation = useMutation( {
		...siteLaunchMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Your site has been launched; now you can share it with the world!' ),
				error: __( 'Failed to launch site' ),
			},
		},
	} );
	const [ isAgencyDevelopmentSiteLaunchModalOpen, setIsAgencyDevelopmentSiteLaunchModalOpen ] =
		useState( false );

	const handleTracksEvent = () => {
		recordTracksEvent( 'calypso_dashboard_site_launch_button_click', { context: tracksContext } );
	};

	const handleLaunch = () => {
		handleTracksEvent();
		launchMutation.mutate( undefined, {
			onSettled: () => {
				setIsAgencyDevelopmentSiteLaunchModalOpen( false );
			},
		} );
	};

	const isSitePlanHostingTrial = site.plan?.product_slug === DotcomPlans.HOSTING_TRIAL_MONTHLY;
	const isSitePlanPaidWithDomains = isSitePlanPaid( site ) && domains.length > 1;
	const isSitePlanLaunchable = getIsSitePlanLaunchable( site );
	const shouldImmediatelyLaunch =
		isSitePlanPaidWithDomains || isSitePlanHostingTrial || site.is_wpcom_staging_site;

	const getLaunchUrl = () => {
		if ( isSitePlanBigSkyTrial( site ) ) {
			return addQueryArgs( '/setup/ai-site-builder/domains', {
				siteId: site.ID,
				source: 'general-settings',
				redirect: 'site-launch',
				new: site.name,
				search: 'yes',
			} );
		}

		return addQueryArgs( '/start/launch-site', {
			siteSlug: site.slug,
			new: site.name,
			hide_initial_query: 'yes',
			back_to: window.location.href.replace( window.location.origin, '' ),
		} );
	};

	const commonProps = {
		size: 'compact' as const,
		variant: 'primary' as const,
		disabled: ! isSitePlanLaunchable,
		isBusy: isLoading || launchMutation.isPending,
		children: __( 'Launch your site' ),
	};

	if ( isLoading ) {
		return null;
	}

	if ( site.is_a4a_dev_site ) {
		return (
			<>
				<Button
					{ ...commonProps }
					onClick={ () => setIsAgencyDevelopmentSiteLaunchModalOpen( true ) }
				/>
				{ isAgencyDevelopmentSiteLaunchModalOpen && (
					<AgencyDevelopmentSiteLaunchModal
						isLaunching={ launchMutation.isPending }
						onClose={ () => setIsAgencyDevelopmentSiteLaunchModalOpen( false ) }
						onLaunch={ handleLaunch }
					/>
				) }
			</>
		);
	}

	if ( shouldImmediatelyLaunch ) {
		return <Button { ...commonProps } onClick={ handleLaunch } />;
	}

	return (
		<Button { ...commonProps } onClick={ () => handleTracksEvent() } href={ getLaunchUrl() } />
	);
}
