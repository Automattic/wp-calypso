import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteLaunchMutation, siteBySlugQuery } from '../../app/queries/site';
import { siteSettingsMutation, siteSettingsQuery } from '../../app/queries/site-settings';
import PageLayout from '../../components/page-layout';
import { DotcomPlans } from '../../data/constants';
import SettingsPageHeader from '../settings-page-header';
import AgencyDevelopmentSiteLaunchModal from './agency-development-site-launch-modal';
import { LaunchAgencyDevelopmentSiteForm, LaunchForm } from './launch-form';
import { PrivacyForm } from './privacy-form';
import { ShareSiteForm } from './share-site-form';
import TrialUpsellNotice from './trial-upsell-notice';
import type { Site } from '../../data/types';
import './style.scss';

export const isSitePlanBigSkyTrial = ( site: Site ) => {
	if ( ! site.plan ) {
		return false;
	}

	const { launch_status, options, plan } = site;
	if ( options?.site_creation_flow !== 'ai-site-builder' || launch_status !== 'unlaunched' ) {
		return false;
	}

	const { product_slug } = plan;
	if ( ! product_slug ) {
		return true;
	}

	const bigSkyPlans = [
		DotcomPlans.BUSINESS,
		DotcomPlans.BUSINESS_MONTHLY,
		DotcomPlans.BUSINESS_2_YEARS,
		DotcomPlans.BUSINESS_3_YEARS,
		DotcomPlans.PREMIUM,
		DotcomPlans.PREMIUM_MONTHLY,
		DotcomPlans.PREMIUM_2_YEARS,
		DotcomPlans.PREMIUM_3_YEARS,
	];

	return ! bigSkyPlans.includes( product_slug as DotcomPlans );
};

export const isSitePlanPaid = ( site: Site ) => {
	if ( ! site.plan ) {
		return false;
	}

	return ! [ DotcomPlans.JETPACK_FREE, DotcomPlans.FREE_PLAN ].includes(
		site.plan.product_slug as DotcomPlans
	);
};

export const isSitePlanLaunchable = ( site: Site ) => {
	return (
		site.plan?.product_slug !== DotcomPlans.ECOMMERCE_TRIAL_MONTHLY &&
		site.plan?.product_slug !== DotcomPlans.MIGRATION_TRIAL_MONTHLY
	);
};

export default function SiteVisibilitySettings( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( site.ID ) );
	const settingsMutation = useMutation( siteSettingsMutation( site.ID ) );
	const launchMutation = useMutation( siteLaunchMutation( site.ID ) );

	const [ isAgencyDevelopmentSiteLaunchModalOpen, setIsAgencyDevelopmentSiteLaunchModalOpen ] =
		useState( false );

	if ( ! settings ) {
		return null;
	}

	const handleLaunch = () => {
		launchMutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice(
					__( 'Your site has been launched; now you can share it with the world!' ),
					{
						type: 'snackbar',
					}
				);
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message || __( 'Failed to launch site' ), {
					type: 'snackbar',
				} );
			},
			onSettled: () => {
				setIsAgencyDevelopmentSiteLaunchModalOpen( false );
			},
		} );
	};

	const renderContent = () => {
		if ( site.launch_status === 'unlaunched' ) {
			return (
				<>
					{ site.is_a4a_dev_site ? (
						<>
							<LaunchAgencyDevelopmentSiteForm
								site={ site }
								onLaunchClick={ () => setIsAgencyDevelopmentSiteLaunchModalOpen( true ) }
							/>
							{ isAgencyDevelopmentSiteLaunchModalOpen && (
								<AgencyDevelopmentSiteLaunchModal
									isLaunching={ launchMutation.isPending }
									onClose={ () => setIsAgencyDevelopmentSiteLaunchModalOpen( false ) }
									onLaunch={ handleLaunch }
								/>
							) }
						</>
					) : (
						<LaunchForm
							site={ site }
							isLaunching={ launchMutation.isPending }
							onLaunchClick={ handleLaunch }
						/>
					) }
					{ site.is_coming_soon && <ShareSiteForm site={ site } /> }
				</>
			);
		}

		return <PrivacyForm site={ site } settings={ settings } mutation={ settingsMutation } />;
	};

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Site visibility' ) }
					description={ __( 'Control who can view your site.' ) }
				/>
			}
		>
			<TrialUpsellNotice site={ site } />
			{ renderContent() }
		</PageLayout>
	);
}
