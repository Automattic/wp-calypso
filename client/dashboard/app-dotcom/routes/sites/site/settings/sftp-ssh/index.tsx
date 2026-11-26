import { HostingFeatures } from '@automattic/api-core';
import {
	siteBySlugQuery,
	siteSftpUsersQuery,
	siteSshAccessStatusQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { folder } from '@wordpress/icons';
import Breadcrumbs from '../../../../../../app/breadcrumbs';
import { PageHeader } from '../../../../../../components/page-header';
import PageLayout from '../../../../../../components/page-layout';
import { ThemedIllustration } from '../../../../../../components/themed-illustration';
import HostingFeatureGatedWithCallout from '../../../../../../sites/hosting-feature-gated-with-callout';
import EnableSftpCard from '../../../../../../sites/sftp-ssh/components/enable-sftp-card';
import SftpCard, {
	type SftpCardSshState,
} from '../../../../../../sites/sftp-ssh/components/sftp-card';
import SshCard from '../../../../../../sites/sftp-ssh/components/ssh-card';
import upsellIllustrationDarkUrl from '../../../../../../sites/sftp-ssh/components/upsell-illustration/upsell-illustration-dark.svg';
import upsellIllustrationUrl from '../../../../../../sites/sftp-ssh/components/upsell-illustration/upsell-illustration.svg';
import { hasHostingFeature } from '../../../../../../utils/site-features';

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
	const sshEnabled = sshAccessStatus?.setting === 'ssh';
	// Until the status loads, or if it fails to, assume SSH may be on so the delete dialog still warns about it.
	let sftpCardSshState: SftpCardSshState = 'unavailable';
	if ( hasSshFeature ) {
		sftpCardSshState = sshAccessStatus?.setting === 'sftp' ? 'disabled' : 'maybe-enabled';
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'SFTP/SSH' ) }
					description={ __(
						'Securely access and manage your website files using SFTP, or use SSH for advanced command-line operations and troubleshooting.'
					) }
				/>
			}
		>
			<HostingFeatureGatedWithCallout
				site={ site }
				feature={ HostingFeatures.SFTP }
				upsellId="site-settings-sftp-ssh"
				upsellIcon={ folder }
				upsellImage={
					<ThemedIllustration light={ upsellIllustrationUrl } dark={ upsellIllustrationDarkUrl } />
				}
				upsellTitle={ __( 'Direct access to your site’s files' ) }
				upsellDescription={ __(
					'SFTP and SSH give you secure, direct access to your site’s filesystem—fast, reliable, and built for your workflow.'
				) }
			>
				{ sftpEnabled ? (
					<SftpCard siteId={ site.ID } sftpUsers={ sftpUsers } sshState={ sftpCardSshState } />
				) : (
					<EnableSftpCard siteId={ site.ID } canUseSsh={ hasSshFeature } />
				) }
				{ sftpEnabled && hasSshFeature && (
					<SshCard siteId={ site.ID } sftpUsers={ sftpUsers } sshEnabled={ sshEnabled } />
				) }
			</HostingFeatureGatedWithCallout>
		</PageLayout>
	);
}
