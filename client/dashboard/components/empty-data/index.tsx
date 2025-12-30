import { __experimentalVStack as VStack } from '@wordpress/components';
import { Card, CardBody } from '../card';
import { Text } from '../text';
import type { ReactNode } from 'react';

const EmptyData = ( {
	title,
	description,
	actions,
}: {
	title: string;
	description: string;
	actions?: ReactNode;
} ) => {
	return (
		<Card>
			<CardBody>
				<VStack style={ { minHeight: '676px' } } spacing={ 2 } alignment="center">
					<Text as="h2" size="20px" weight={ 500 } align="center">
						{ title }
					</Text>
					<Text style={ { maxWidth: '351px' } } align="center">
						{ description }
					</Text>
					{ actions }
				</VStack>
			</CardBody>
		</Card>
	);
};

export default EmptyData;
