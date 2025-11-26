import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Card, CardBody, CardHeader } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { TextSkeleton } from '../../components/text-skeleton';

export function BackupDetailsSkeleton() {
	return (
		<Card>
			<CardHeader style={ { flexDirection: 'column', alignItems: 'stretch' } }>
				<SectionHeader title={ <TextSkeleton length={ 20 } /> } />
			</CardHeader>
			<CardBody style={ { minHeight: '300px' } }>
				<VStack spacing="4">
					<TextSkeleton length={ 35 } />
					<HStack spacing={ 1 }>
						<TextSkeleton length={ 25 } />
					</HStack>
					<VStack spacing="2">
						<TextSkeleton length={ 15 } />
						<TextSkeleton length={ 18 } />
						<TextSkeleton length={ 12 } />
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
