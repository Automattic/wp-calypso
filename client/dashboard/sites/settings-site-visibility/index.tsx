import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteQuery, siteSettingsMutation, siteSettingsQuery } from '../../app/queries';
import { Notice } from '../../components/notice';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import { LaunchAgencyDevelopmentSiteForm, LaunchForm } from './launch-form';
import { PrivacyForm } from './privacy-form';
import './style.scss';

export default function SiteVisibilitySettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );
	const mutation = useMutation( siteSettingsMutation( siteSlug ) );

	if ( ! settings || ! site ) {
		return null;
	}

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
			{ site.launch_status === 'unlaunched' ? (
				<Notice>
					{ site.is_a4a_dev_site ? (
						<LaunchAgencyDevelopmentSiteForm site={ site } />
					) : (
						<LaunchForm site={ site } />
					) }
				</Notice>
			) : (
				<Card>
					<CardBody>
						<PrivacyForm settings={ settings } mutation={ mutation } />
					</CardBody>
				</Card>
			) }
		</PageLayout>
	);
}
