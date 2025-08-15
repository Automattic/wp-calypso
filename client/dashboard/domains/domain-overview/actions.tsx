import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Actions() {
	return (
		<VStack spacing={ 4 }>
			<Text as="h2" size="medium" weight={ 500 }>
				{ __( 'Actions' ) }
			</Text>
			<Card>
				<CardBody>
					<Text>Lorem ipsum</Text>
				</CardBody>
			</Card>
		</VStack>
	);
}
