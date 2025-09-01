import {
	siteLaunchMutation,
	siteBySlugQuery,
	siteSettingsMutation,
	siteSettingsQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import AgencyDevelopmentSiteLaunchModal from './agency-development-site-launch-modal';
import { LaunchAgencyDevelopmentSiteForm, LaunchForm } from './launch-form';
import { PrivacyForm } from './privacy-form';
import { ShareSiteForm } from './share-site-form';

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
					description={ createInterpolateElement(
						__( 'Control who can view your site. <link>Learn more</link>' ),
						{
							link: <InlineSupportLink supportContext="privacy" />,
						}
					) }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
