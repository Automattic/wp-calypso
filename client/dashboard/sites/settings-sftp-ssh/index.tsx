import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { siteQuery, siteSftpUsersQuery, siteSshAccessStatusQuery } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';
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

	return (
		<PageLayout size="small" header={ <SettingsPageHeader title={ __( 'SFTP/SSH' ) } /> }>
			<VStack spacing={ 8 }>
				{ sftpEnabled ? (
					<SftpCard siteSlug={ site.slug } sftpUsers={ sftpUsers } />
				) : (
					<EnableSftpCard siteSlug={ site.slug } canUseSsh={ canUseSsh( site ) } />
				) }
				{ canUseSsh( site ) && (
					<SshCard siteSlug={ site.slug } sshEnabled={ sshAccessStatus?.settings === 'ssh' } />
				) }
			</VStack>
		</PageLayout>
	);
}
