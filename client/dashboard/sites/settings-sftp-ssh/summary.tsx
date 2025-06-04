import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { file } from '@wordpress/icons';
import { siteSftpUsersQuery, siteSshAccessStatusQuery } from '../../app/queries';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { canUseSftp, canUseSsh } from '../../utils/site-features';
import type { Site } from '../../data/types';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SftpSshSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
	const { data: sftpUsers } = useQuery( {
		...siteSftpUsersQuery( site.slug ),
		enabled: canUseSftp( site ),
	} );

	const { data: sshAccessStatus } = useQuery( {
		...siteSshAccessStatusQuery( site.slug ),
		enabled: canUseSsh( site ),
	} );

	const sftpEnabled = sftpUsers && sftpUsers.length > 0;

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
	].filter( ( badge ) => !! badge );

	return (
		<RouterLinkSummaryButton
			to={ `/sites/${ site.slug }/settings/sftp-ssh` }
			title={ __( 'SFTP/SSH' ) }
			density={ density }
			decoration={ <Icon icon={ file } /> }
			badges={ badges }
		/>
	);
}
