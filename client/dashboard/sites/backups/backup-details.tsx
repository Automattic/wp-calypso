import { useRouter } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	CardHeader,
	Icon,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { rotateLeft, download } from '@wordpress/icons';
import { siteBackupRestoreRoute, siteBackupDownloadRoute } from '../../app/router/sites';
import { useFormattedTime } from '../../components/formatted-time';
import { SectionHeader } from '../../components/section-header';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import type { ActivityLogEntry, Site } from '../../data/types';

export function BackupDetails( { backup, site }: { backup: ActivityLogEntry; site: Site } ) {
	const router = useRouter();
	const formattedTime = useFormattedTime( backup.published, {
		dateStyle: 'medium',
		timeStyle: 'short',
	} );

	const handleRestoreClick = () => {
		router.navigate( {
			to: siteBackupRestoreRoute.fullPath,
			params: { siteSlug: site.slug, rewindId: backup.rewind_id },
		} );
	};

	const handleDownloadClick = () => {
		router.navigate( {
			to: siteBackupDownloadRoute.fullPath,
			params: { siteSlug: site.slug, rewindId: backup.rewind_id },
		} );
	};

	return (
		<Card>
			<CardHeader style={ { flexDirection: 'column', alignItems: 'stretch' } }>
				<SectionHeader
					title={ backup.summary }
					decoration={ <Icon icon={ gridiconToWordPressIcon( backup.gridicon ) } /> }
					actions={
						backup.rewind_id && (
							<HStack spacing={ 2 }>
								<Button
									variant="secondary"
									size="compact"
									icon={ download }
									onClick={ handleDownloadClick }
								>
									{ __( 'Download backup' ) }
								</Button>
								<Button
									variant="primary"
									size="compact"
									icon={ rotateLeft }
									onClick={ handleRestoreClick }
								>
									{ __( 'Restore to this point' ) }
								</Button>
							</HStack>
						)
					}
				/>
			</CardHeader>
			<CardBody>
				<VStack>
					<Text size={ 14 } weight={ 500 }>
						{ backup.content.text }
					</Text>
					<HStack alignment="left" spacing={ 4 }>
						<Text variant="muted">{ formattedTime }</Text>
						{ backup.actor?.name && (
							<Text variant="muted">
								{
									/* translators: %s is the name of the person/system who performed the backup */
									sprintf( __( 'By %s' ), backup.actor.name )
								}
							</Text>
						) }
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
