import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { file } from '@wordpress/icons';
import { siteQuery, siteSftpUsersQuery, siteSshAccessStatusQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import { canUseSftp, canUseSsh } from '../../utils/site-features';
import SettingsCallout from '../settings-callout';
import SettingsPageHeader from '../settings-page-header';
import calloutIllustrationUrl from './callout-illustration.svg';
import EnableSftpCard from './enable-sftp-card';
import SftpCard from './sftp-card';
import SshCard from './ssh-card';

export default function SftpSshSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: sftpUsers } = useQuery( {
		...siteSftpUsersQuery( siteSlug ),
		enabled: site && canUseSftp( site ),
	} );

	const { data: sshAccessStatus } = useQuery( {
		...siteSshAccessStatusQuery( siteSlug ),
		enabled: site && canUseSsh( site ),
	} );

	const sftpEnabled = sftpUsers && sftpUsers.length > 0;

	if ( ! site ) {
		return null;
	}

	if ( ! canUseSftp( site ) ) {
		return (
			<PageLayout size="small" header={ <SettingsPageHeader title={ __( 'SFTP/SSH' ) } /> }>
				<SettingsCallout
					siteSlug={ siteSlug }
					icon={ file }
					image={ calloutIllustrationUrl }
					title={ __( 'Direct access to your site’s files' ) }
					description={ __(
						'SFTP and SSH give you secure, direct access to your site’s filesystem—fast, reliable, and built for your workflow.'
					) }
				/>
			</PageLayout>
		);
	}

	return (
		<PageLayout size="small" header={ <SettingsPageHeader title={ __( 'SFTP/SSH' ) } /> }>
			{ sftpEnabled ? (
				<SftpCard siteSlug={ site.slug } sftpUsers={ sftpUsers } />
			) : (
				<EnableSftpCard siteSlug={ site.slug } canUseSsh={ canUseSsh( site ) } />
			) }
			{ sftpEnabled && canUseSsh( site ) && (
				<SshCard
					siteSlug={ site.slug }
					sftpUsers={ sftpUsers }
					sshEnabled={ sshAccessStatus?.setting === 'ssh' }
				/>
			) }
		</PageLayout>
	);
}
