import {
	Button,
	Card,
	CardBody,
	__experimentalView as View,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalInputControl as InputControl,
	CheckboxControl,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import './styles.scss';

export default function NameServers() {
	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Name Servers' ) } /> }>
			<Card>
				<CardBody className="domains-management__name-servers">
					<VStack spacing={ 4 }>
						<Text>
							<CheckboxControl
								label={ __( 'Use custom name servers' ) }
								checked={ false }
								onChange={ () => {} }
							/>
						</Text>
						<HStack spacing={ 2 } justify="space-between">
							<InputControl
								__next40pxDefaultSize
								label={ __( 'Custom name server 1' ) }
								placeholder={ __( 'ns1.domain.com' ) }
								onChange={ () => {} }
							/>
							<InputControl
								__next40pxDefaultSize
								label={ __( 'Custom name server 2' ) }
								placeholder={ __( 'ns2.domain.com' ) }
								onChange={ () => {} }
							/>
						</HStack>
						<View>
							<Button variant="primary">{ __( 'Save' ) }</Button>
						</View>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
