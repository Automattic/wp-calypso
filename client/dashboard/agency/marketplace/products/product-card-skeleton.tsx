import { __experimentalVStack as VStack } from '@wordpress/components';
import { Card, CardBody } from '../../../components/card';
import { TextSkeleton } from '../../../components/text-skeleton';

// Same shape as a product card: title, badges, price, description, and the
// action row, so the grid doesn't jump once products load.
export default function ProductCardSkeleton() {
	return (
		<Card className="dashboard-marketplace-products__card">
			<CardBody className="dashboard-marketplace-products__card-body">
				<VStack
					spacing={ 3 }
					justify="flex-start"
					className="dashboard-marketplace-products__card-main"
				>
					<TextSkeleton length={ 18 } />
					<TextSkeleton length={ 10 } />
					<TextSkeleton length={ 12 } />
					<VStack spacing={ 1 }>
						<TextSkeleton length={ 26 } />
						<TextSkeleton length={ 20 } />
					</VStack>
				</VStack>
				<div className="dashboard-marketplace-products__card-footer">
					<TextSkeleton length={ 18 } />
				</div>
			</CardBody>
		</Card>
	);
}
