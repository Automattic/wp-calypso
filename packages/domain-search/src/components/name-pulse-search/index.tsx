import { Card, CardBody, __experimentalText as Text } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

export const NamePulseSearch = () => {
	const { __ } = useI18n();

	return (
		<Card role="listitem" isBorderless>
			<CardBody style={ { borderRadius: 0 } }>
				<Text weight={ 500 }>{ __( 'Name Pulse search' ) }</Text>
			</CardBody>
		</Card>
	);
};
