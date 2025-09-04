import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useAnalytics } from '../../app/analytics';
import { siteBackupsRoute } from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import type { Site } from '@automattic/api-core';

const SiteBackupRestoreSuccess = ( {
	restorePointDate,
	site,
}: {
	restorePointDate: string;
	site: Site;
} ) => {
	const { recordTracksEvent } = useAnalytics();
	const router = useRouter();

	const handleAllBackupsClick = () => {
		recordTracksEvent( 'calypso_dashboard_backups_restore_all_backups' );
		router.navigate( { to: siteBackupsRoute.fullPath, params: { siteSlug: site.slug } } );
	};

	const handleViewWebsiteClick = () => {
		recordTracksEvent( 'calypso_dashboard_backups_restore_view_website' );
		window.open( site.URL, '_blank' );
	};

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
			<ButtonStack justify="flex-end">
				<Button variant="tertiary" text={ __( 'All backups' ) } onClick={ handleAllBackupsClick } />
				<Button
					variant="primary"
					text={ __( 'View website ↗' ) }
					onClick={ handleViewWebsiteClick }
				/>
			</ButtonStack>
		</HStack>
	);
};

export default SiteBackupRestoreSuccess;
