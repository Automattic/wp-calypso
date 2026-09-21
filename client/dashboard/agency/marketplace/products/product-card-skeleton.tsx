import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Card, CardBody } from '../../../components/card';
import { TextSkeleton } from '../../../components/text-skeleton';

// Same shape as a product card: brand mark and badges, title, description,
// price, and the action row, so the grid doesn't jump once products load.
export default function ProductCardSkeleton() {
	return (
		<Card className="dashboard-marketplace-products__card">
			<CardBody className="dashboard-marketplace-products__card-body">
				<VStack
					spacing={ 3 }
					justify="flex-start"
					className="dashboard-marketplace-products__card-main"
				>
					<HStack spacing={ 2 } justify="space-between" alignment="flex-start">
						<TextSkeleton length={ 4 } />
						<TextSkeleton length={ 10 } />
					</HStack>
					<VStack spacing={ 1 }>
						<TextSkeleton length={ 18 } />
						<TextSkeleton length={ 26 } />
						<TextSkeleton length={ 20 } />
					</VStack>
				</VStack>
				<VStack spacing={ 3 } className="dashboard-marketplace-products__card-footer">
					<TextSkeleton length={ 12 } />
					<TextSkeleton length={ 18 } />
				</VStack>
			</CardBody>
		</Card>
	);
}
