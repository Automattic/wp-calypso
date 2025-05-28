import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { file } from '@wordpress/icons';
import { siteQuery, siteSftpUsersQuery, siteSshAccessStatusQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import SettingsCallout from '../settings-callout';
import SettingsPageHeader from '../settings-page-header';
import calloutIllustrationUrl from './callout-illustration.svg';
import EnableSftpCard from './enable-sftp-card';
import SftpCard from './sftp-card';
import SshCard from './ssh-card';
import { canUseSftp, canUseSsh } from './utils';

export default function SftpSshSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: sftpUsers } = useQuery( {
		...siteSftpUsersQuery( site.slug ),
		enabled: canUseSftp( site ),
	} );

	const { data: sshAccessStatus } = useQuery( {
		...siteSshAccessStatusQuery( site.slug ),
		enabled: canUseSsh( site ),
	} );

	const sftpEnabled = sftpUsers?.length > 0;

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
			<VStack spacing={ 8 }>
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
			</VStack>
		</PageLayout>
	);
}
