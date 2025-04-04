import {
	__experimentalVStack as VStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalHeading as Heading,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

function Security() {
	return (
		<VStack spacing={ 4 }>
			<Heading level={ 2 }>{ __( 'Security' ) }</Heading>
			<Card>
				<CardBody>
					<p>{ __( 'This is a placeholder for the Security page.' ) }</p>
				</CardBody>
			</Card>
		</VStack>
	);
}

export default Security;
