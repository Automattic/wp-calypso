import { HostingFeatures } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { file } from '@wordpress/icons';
import { siteSftpUsersQuery } from '../../app/queries/site-sftp';
import { siteSshAccessStatusQuery } from '../../app/queries/site-ssh';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import { hasHostingFeature } from '../../utils/site-features';
import type { Site } from '@automattic/api-core';
import type { Density } from '@automattic/components/src/summary-button/types';

export default function SftpSshSettingsSummary( {
	site,
	density,
}: {
	site: Site;
	density?: Density;
} ) {
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

	const sshEnabled = sshAccessStatus?.setting === 'ssh';

	const badges = [
		hasSftpFeature && {
			text: sftpEnabled ? __( 'SFTP enabled' ) : __( 'SFTP disabled' ),
			intent: sftpEnabled ? ( 'success' as const ) : undefined,
		},
		hasSshFeature && {
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
