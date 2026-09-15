import { Card, CardBody, __experimentalText as Text } from '@wordpress/components';

export const NamePulseSearch = () => (
	<Card role="listitem" isBorderless>
		<CardBody style={ { borderRadius: 0 } }>
			<Text weight={ 500 }>Name Pulse search</Text>
		</CardBody>
	</Card>
);
