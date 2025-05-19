import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { siteQuery, siteSettingsMutation, siteSettingsQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
import { LaunchForm } from './launch-form';
import { PrivacyForm } from './privacy-form';

export default function SiteVisibilitySettings( { siteSlug }: { siteSlug: string } ) {
	const { data: siteData } = useQuery( siteQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( siteSlug ) );
	const mutation = useMutation( siteSettingsMutation( siteSlug ) );

	if ( ! settings || ! siteData ) {
		return null;
	}

	const { site } = siteData;

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
			<Card>
				<CardBody>
					{ site.launch_status === 'unlaunched' ? (
						<LaunchForm site={ site } />
					) : (
						<PrivacyForm settings={ settings } mutation={ mutation } />
					) }
				</CardBody>
			</Card>
		</PageLayout>
	);
}
