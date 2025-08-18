import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardBody,
	CardHeader,
	Icon,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useFormattedTime } from '../../components/formatted-time';
import { SectionHeader } from '../../components/section-header';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import type { ActivityLogEntry } from '../../data/types';

export function BackupDetails( { backup }: { backup: ActivityLogEntry } ) {
	const formattedTime = useFormattedTime( backup.published, {
		dateStyle: 'medium',
		timeStyle: 'short',
	} );

	return (
		<Card>
			<CardHeader>
				<SectionHeader
					title={ backup.summary }
					decoration={ <Icon icon={ gridiconToWordPressIcon( backup.gridicon ) } /> }
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
