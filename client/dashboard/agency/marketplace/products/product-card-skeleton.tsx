import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { TextSkeleton } from '../../../components/text-skeleton';

import '../../components/showcase/body-card.scss';

// Same shape as a store card: the 40px tile beside the title and byline, two
// lines of description, the price, and the actions, so the grid doesn't jump
// once products load.
export default function ProductCardSkeleton() {
	return (
		<div className="dashboard-body-card" aria-hidden="true">
			<div className="dashboard-body-card__head">
				<span className="dashboard-marketplace-products__skeleton-tile" />
				<VStack spacing={ 1 }>
					<TextSkeleton length={ 14 } />
					<TextSkeleton length={ 8 } />
				</VStack>
			</div>
			<VStack spacing={ 1 }>
				<TextSkeleton length={ 30 } />
				<TextSkeleton length={ 22 } />
			</VStack>
			<TextSkeleton length={ 12 } />
			<HStack spacing={ 3 } justify="flex-start">
				<TextSkeleton length={ 10 } />
				<TextSkeleton length={ 10 } />
			</HStack>
		</div>
	);
}
