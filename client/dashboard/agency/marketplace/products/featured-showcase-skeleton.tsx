import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { Card, CardBody } from '../../../components/card';
import { SectionHeader } from '../../../components/section-header';
import { TextSkeleton } from '../../../components/text-skeleton';

// Holds the featured row's space while products load, so search and the
// category tiles don't jump down when the row appears.
export default function FeaturedShowcaseSkeleton() {
	return (
		<VStack spacing={ 4 } aria-hidden="true">
			<SectionHeader level={ 2 } title={ __( 'Featured plugins and add-ons' ) } />
			<HStack
				spacing={ 4 }
				justify="flex-start"
				alignment="stretch"
				className="dashboard-marketplace-products__featured-skeleton"
			>
				{ Array.from( { length: 3 }, ( _, index ) => (
					<Card
						key={ index }
						isBorderless
						className={ clsx( 'dashboard-marketplace-products__featured-skeleton-tile', {
							'is-lead': index === 0,
						} ) }
					>
						<CardBody>
							<VStack spacing={ 2 }>
								<TextSkeleton length={ 10 } />
								<TextSkeleton length={ 18 } />
								<TextSkeleton length={ 26 } />
							</VStack>
						</CardBody>
					</Card>
				) ) }
			</HStack>
		</VStack>
	);
}
