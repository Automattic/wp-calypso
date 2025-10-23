import { HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteSftpUsersQuery,
	siteSshAccessStatusQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { file } from '@wordpress/icons';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { hasHostingFeature } from '../../utils/site-features';
import HostingFeatureGatedWithCallout from '../hosting-feature-gated-with-callout';
import EnableSftpCard from './enable-sftp-card';
import SftpCard from './sftp-card';
import SshCard from './ssh-card';
import upsellIllustrationUrl from './upsell-illustration.svg';

export default function SftpSshSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	const hasSftpFeature = hasHostingFeature( site, HostingFeatures.SFTP );
	const hasSshFeature = hasHostingFeature( site, HostingFeatures.SSH );

	const { data: sftpUsers } = useQuery( {
		...siteSftpUsersQuery( site.ID ),
		enabled: hasSftpFeature,
	} );

	const { data: sshAccessStatus } = useQuery( {
		...siteSshAccessStatusQuery( site.ID ),
		enabled: hasSshFeature,
	} );

	const sftpEnabled = sftpUsers && sftpUsers.length > 0;

	return (
		<PageLayout
			size="small"
			header={ <PageHeader prefix={ <Breadcrumbs length={ 2 } /> } title={ __( 'SFTP/SSH' ) } /> }
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.SFTP }
				upsellId="site-settings-sftp-ssh"
				upsellIcon={ file }
				upsellImage={ upsellIllustrationUrl }
				upsellTitle={ __( 'Direct access to your site’s files' ) }
				upsellDescription={ __(
					'SFTP and SSH give you secure, direct access to your site’s filesystem—fast, reliable, and built for your workflow.'
				) }
			>
				{ sftpEnabled ? (
					<SftpCard siteId={ site.ID } sftpUsers={ sftpUsers } />
				) : (
					<EnableSftpCard siteId={ site.ID } canUseSsh={ hasSshFeature } />
				) }
				{ sftpEnabled && hasSshFeature && (
					<SshCard
						siteId={ site.ID }
						sftpUsers={ sftpUsers }
						sshEnabled={ sshAccessStatus?.setting === 'ssh' }
					/>
				) }
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
