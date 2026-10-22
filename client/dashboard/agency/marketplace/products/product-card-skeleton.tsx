import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Card, CardBody } from '../../../components/card';
import { TextSkeleton } from '../../../components/text-skeleton';

import '../../components/showcase/body-card.scss';

// Matches the store card's shape so the grid doesn't jump once products load.
export default function ProductCardSkeleton() {
	return (
		<Card className="dashboard-body-card" aria-hidden="true">
			<CardBody className="dashboard-body-card__body">
				<VStack spacing={ 3 } justify="flex-start" className="dashboard-body-card__stack">
					<HStack spacing={ 3 } justify="flex-start">
						<span className="dashboard-marketplace-products__skeleton-tile" />
						<VStack spacing={ 1 }>
							<TextSkeleton length={ 14 } />
							<TextSkeleton length={ 8 } />
						</VStack>
					</HStack>
					<VStack spacing={ 1 }>
						<TextSkeleton length={ 30 } />
						<TextSkeleton length={ 22 } />
					</VStack>
					<TextSkeleton length={ 12 } />
					<HStack spacing={ 3 } justify="flex-start">
						<TextSkeleton length={ 10 } />
						<TextSkeleton length={ 10 } />
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
