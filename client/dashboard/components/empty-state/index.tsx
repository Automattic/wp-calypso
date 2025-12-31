import { __experimentalVStack as VStack } from '@wordpress/components';
import { Card, CardBody } from '../card';
import { Text } from '../text';
import type { ReactNode } from 'react';

export default function EmptyState( {
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children?: ReactNode;
} ) {
	return (
		<Card>
			<CardBody>
				<VStack style={ { minHeight: '676px' } } spacing={ 8 } alignment="center">
					<VStack spacing={ 2 }>
						<Text as="h2" size="20px" weight={ 500 } align="center">
							{ title }
						</Text>
						<Text style={ { maxWidth: '351px' } } variant="muted" align="center">
							{ description }
						</Text>
					</VStack>
					<div style={ { maxWidth: '660px' } }>{ children }</div>
				</VStack>
			</CardBody>
		</Card>
	);
}
