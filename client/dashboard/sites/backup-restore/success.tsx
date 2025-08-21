import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { siteBackupsRoute } from '../../app/router/sites';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { Site } from '../../data/types';

const SiteBackupRestoreSuccess = ( {
	restorePointDate,
	site,
}: {
	restorePointDate: string;
	site: Site;
} ) => {
	const router = useRouter();

	return (
		<HStack spacing={ 4 }>
			<HStack justify="flex-start">
				<Icon icon={ check } />
				<VStack spacing={ 1 }>
					<Text size={ 15 }>{ __( 'Site successfully restored' ) }</Text>
					<Text size={ 13 } variant="muted">
						{ restorePointDate }
					</Text>
				</VStack>
			</HStack>
			<HStack justify="flex-end">
				<Button
					variant="tertiary"
					text={ __( 'All backups' ) }
					onClick={ () =>
						router.navigate( { to: siteBackupsRoute.fullPath, params: { siteSlug: site.slug } } )
					}
				/>
				<Button
					variant="primary"
					href={ getSiteDisplayUrl( site ) }
					target="_blank"
					text={ __( 'View website ↗' ) }
				/>
			</HStack>
		</HStack>
	);
};

export default SiteBackupRestoreSuccess;
