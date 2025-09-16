import { useRouter } from '@tanstack/react-router';
import {
	__experimentalGrid as Grid,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	CardHeader,
	Icon,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { rotateLeft, download } from '@wordpress/icons';
import { siteBackupRestoreRoute, siteBackupDownloadRoute } from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import { useFormattedTime } from '../../components/formatted-time';
import { SectionHeader } from '../../components/section-header';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import { ImagePreview } from './image-preview';
import type { ActivityLogEntry, Site } from '@automattic/api-core';

export function BackupDetails( { backup, site }: { backup: ActivityLogEntry; site: Site } ) {
	const router = useRouter();
	const publishedTimestamp = backup.published || backup.last_published;
	const formattedTime = useFormattedTime( publishedTimestamp, {
		dateStyle: 'medium',
		timeStyle: 'short',
	} );

	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const direction = isSmallViewport ? 'column-reverse' : 'row';

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

	const actions = backup.rewind_id ? (
		<ButtonStack alignment="stretch" justify="center" direction={ direction }>
			<Button
				variant="tertiary"
				size={ isSmallViewport ? 'default' : 'compact' }
				icon={ download }
				onClick={ handleDownloadClick }
				style={ { justifyContent: 'center' } }
			>
				{ __( 'Download backup' ) }
			</Button>
			<Button
				variant="primary"
				size={ isSmallViewport ? 'default' : 'compact' }
				icon={ rotateLeft }
				onClick={ handleRestoreClick }
				style={ { justifyContent: 'center' } }
			>
				{ __( 'Restore to this point' ) }
			</Button>
		</ButtonStack>
	) : null;

	return (
		<Card>
			<CardHeader style={ { flexDirection: 'column', alignItems: 'stretch' } }>
				<SectionHeader
					title={ backup.summary }
					decoration={ <Icon icon={ gridiconToWordPressIcon( backup.gridicon ) } /> }
					actions={ ! isSmallViewport ? actions : null }
				/>
				{ isSmallViewport ? actions : null }
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
					<Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))">
						{ backup.streams ? (
							backup.streams.map( ( item, index ) => (
								<ImagePreview key={ index } item={ item } multipleImages />
							) )
						) : (
							<ImagePreview item={ backup } />
						) }
					</Grid>
				</VStack>
			</CardBody>
		</Card>
	);
}
