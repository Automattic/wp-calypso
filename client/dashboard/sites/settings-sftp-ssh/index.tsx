import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { file } from '@wordpress/icons';
import { siteBySlugQuery } from '../../app/queries/site';
import { siteSftpUsersQuery } from '../../app/queries/site-sftp';
import { siteSshAccessStatusQuery } from '../../app/queries/site-ssh';
import PageLayout from '../../components/page-layout';
import { HostingFeatures, canViewSftpSettings, canViewSshSettings } from '../features';
import HostingFeature from '../hosting-feature';
import SettingsPageHeader from '../settings-page-header';
import EnableSftpCard from './enable-sftp-card';
import SftpCard from './sftp-card';
import SshCard from './ssh-card';
import upsellIllustrationUrl from './upsell-illustration.svg';

export default function SftpSshSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: sftpUsers } = useQuery( {
		...siteSftpUsersQuery( site.ID ),
		enabled: canViewSftpSettings( site ),
	} );

	const { data: sshAccessStatus } = useQuery( {
		...siteSshAccessStatusQuery( site.ID ),
		enabled: canViewSshSettings( site ),
	} );

	const sftpEnabled = sftpUsers && sftpUsers.length > 0;

	return (
		<PageLayout size="small" header={ <SettingsPageHeader title={ __( 'SFTP/SSH' ) } /> }>
			<HostingFeature
				site={ site }
				feature={ HostingFeatures.SFTP }
				tracksFeatureId="settings-sftp-ssh"
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
					<EnableSftpCard siteId={ site.ID } canUseSsh={ canViewSshSettings( site ) } />
				) }
				{ sftpEnabled && canViewSshSettings( site ) && (
					<SshCard
						siteId={ site.ID }
						sftpUsers={ sftpUsers }
						sshEnabled={ sshAccessStatus?.setting === 'ssh' }
					/>
				) }
			</HostingFeature>
		</PageLayout>
	);
}
