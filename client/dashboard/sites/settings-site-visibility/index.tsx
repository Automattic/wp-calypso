import { useQuery, useMutation } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { siteQuery, siteSettingsMutation, siteSettingsQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import AgencyDevelopmentSiteLaunchModal from './agency-development-site-launch-modal';
import { LaunchAgencyDevelopmentSiteForm, LaunchForm } from './launch-form';
import { PrivacyForm } from './privacy-form';
import { ShareSiteForm } from './share-site-form';
import './style.scss';

export default function SiteVisibilitySettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );
	const mutation = useMutation( siteSettingsMutation( siteSlug ) );

	const [ isAgencyDevelopmentSiteLaunchModalOpen, setIsAgencyDevelopmentSiteLaunchModalOpen ] =
		useState( false );

	if ( ! settings || ! site ) {
		return null;
	}

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
									site={ site }
									onClose={ () => setIsAgencyDevelopmentSiteLaunchModalOpen( false ) }
								/>
							) }
						</>
					) : (
						<LaunchForm site={ site } />
					) }
					{ site.is_coming_soon && <ShareSiteForm site={ site } /> }
				</>
			);
		}

		return <PrivacyForm site={ site } settings={ settings } mutation={ mutation } />;
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
			{ renderContent() }
		</PageLayout>
	);
}
