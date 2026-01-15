import { DotcomPlans } from '@automattic/api-core';
import { domainsQuery, siteLaunchMutation } from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import {
	isSitePlanLaunchable as getIsSitePlanLaunchable,
	isSitePlanBigSkyTrial,
	isSitePlanPaid,
} from '../plans';
import type { Site } from '@automattic/api-core';

export function SiteLaunchButton( {
	site,
	tracksContext,
	launchUrl,
	LaunchModal,
}: {
	site: Site;
	tracksContext: string;
	launchUrl?: string;
	LaunchModal?: React.ComponentType< {
		isLaunching: boolean;
		onClose: () => void;
		onLaunch: () => void;
	} >;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { data: domains = [], isLoading } = useQuery( {
		...domainsQuery(),
		select: ( data ) => data.filter( ( domain ) => domain.blog_id === site.ID ),
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
	const [ isLaunchModalOpen, setIsLaunchModalOpen ] = useState( false );

	const handleTracksEvent = () => {
		recordTracksEvent( 'calypso_dashboard_site_launch_button_click', { context: tracksContext } );
	};

	const handleLaunch = () => {
		handleTracksEvent();
		launchMutation.mutate( undefined, {
			onSettled: () => {
				setIsLaunchModalOpen( false );
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
			back_to: redirectToDashboardLink( { supportBackport: true } ),
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
		if ( launchUrl ) {
			return <Button { ...commonProps } onClick={ handleTracksEvent } href={ launchUrl } />;
		}

		if ( ! LaunchModal ) {
			return null;
		}

		return (
			<>
				<Button { ...commonProps } onClick={ () => setIsLaunchModalOpen( true ) } />
				{ isLaunchModalOpen && (
					<LaunchModal
						isLaunching={ launchMutation.isPending }
						onClose={ () => setIsLaunchModalOpen( false ) }
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
