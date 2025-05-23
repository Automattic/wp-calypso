import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import PageLayout from '../../components/page-layout';
import SettingsPageHeader from '../settings-page-header';

export default function SiteDatabaseSettings() {
	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Database' ) }
					description={ __(
						'For the tech-savvy, manage your database with phpMyAdmin and run a wide range of operations with MySQL.'
					) }
				/>
			}
		>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<VStack spacing={ 2 }>
							<Text size="15px" weight={ 500 } lineHeight="20px">
								phpMyAdmin
							</Text>
							<Text variant="muted" lineHeight="20px">
								{ __(
									'phpMyAdmin is a free open source software tool that allows you to administer your site’s MySQL database over the Web.'
								) }
							</Text>
						</VStack>
						<VStack>
							<Notice isDismissible={ false }>
								{ __(
									'Managing a database can be tricky and it’s not necessary for your site to function.'
								) }
							</Notice>
						</VStack>
						<HStack justify="flex-start" expanded={ false } as="span">
							<Button variant="primary">{ __( 'Open phpMyAdmin' ) }</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
