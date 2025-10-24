import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardBody,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { copy, globe, scheduled } from '@wordpress/icons';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';

const GUIDE_LIST = [
	{
		icon: scheduled,
		text: __(
			'We’ll investigate what happened and get back to you within a business day with next steps.'
		),
	},
	{
		icon: copy,
		text: __( 'We’ll bring over a copy of your site without affecting your current live version.' ),
	},
	{
		icon: globe,
		text: __( 'We’ll help you switch your domain after we have completed the migration.' ),
	},
];

export default function SSHMigrationFailed() {
	return (
		<PageLayout size="small">
			<VStack spacing={ 8 } expanded={ false }>
				<PageHeader
					title={ __( 'We hit a snag, but we’re on it' ) }
					description={ __(
						'Your migration ran into an issue but don’t worry — our migration team will take over from here and get your site moved safely.'
					) }
				/>
				<Card size="medium">
					<CardBody>
						<VStack spacing={ 3 }>
							<SectionHeader title={ __( 'What to expect' ) } level={ 3 } />
							{ GUIDE_LIST.map( ( item, index ) => (
								<HStack justify="flex-start" key={ index } spacing={ 3 }>
									<Card size="extraSmall" style={ { minWidth: '40px' } }>
										<CardBody style={ { lineHeight: '0' } }>
											<Icon
												icon={ item.icon }
												size={ 24 }
												style={ { fill: 'var(--wp-admin-theme-color-muted, #646970)' } }
											/>
										</CardBody>
									</Card>
									<Text variant="muted">{ item.text }</Text>
								</HStack>
							) ) }
						</VStack>
					</CardBody>
				</Card>
			</VStack>
		</PageLayout>
	);
}
