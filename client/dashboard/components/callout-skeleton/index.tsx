import { __experimentalVStack as VStack } from '@wordpress/components';
import { Card, CardBody } from '../card';
import { TextSkeleton } from '../text-skeleton';

export function CalloutSkeleton() {
	return (
		<Card>
			<CardBody style={ { padding: '24px' } }>
				<VStack spacing="4">
					<TextSkeleton length={ 15 } />
					<TextSkeleton length={ 30 } />
				</VStack>
			</CardBody>
		</Card>
	);
}
