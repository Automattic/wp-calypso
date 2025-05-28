import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { file } from '@wordpress/icons';
import { siteSftpUsersQuery, siteSshAccessStatusQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUseSftp, canUseSsh } from './utils';
import type { Site } from '../../data/types';

export default function SftpSshSettingsSummary( { site }: { site: Site } ) {
	const { data: sftpUsers } = useQuery( {
		...siteSftpUsersQuery( site.slug ),
		enabled: canUseSftp( site ),
	} );

	const { data: sshAccessStatus } = useQuery( {
		...siteSshAccessStatusQuery( site.slug ),
		enabled: canUseSsh( site ),
	} );

	const sftpEnabled = sftpUsers?.length > 0;

	const sshEnabled = sshAccessStatus?.setting === 'ssh';

	const badges = [
		{
			text: sftpEnabled ? __( 'SFTP enabled' ) : __( 'SFTP disabled' ),
			intent: sftpEnabled ? ( 'success' as const ) : undefined,
		},
		canUseSsh( site ) && {
			text: sshEnabled ? __( 'SSH enabled' ) : __( 'SSH disabled' ),
			intent: sshEnabled ? ( 'success' as const ) : undefined,
		},
	].filter( Boolean );

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/sftp-ssh` }
			title="SFTP/SSH"
			density="medium"
			decoration={ <Icon icon={ file } /> }
			badges={ badges }
		/>
	);
}
