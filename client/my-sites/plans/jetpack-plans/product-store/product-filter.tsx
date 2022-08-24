import { useTranslate } from 'i18n-calypso';
import SegmentedControl from 'calypso/components/segmented-control';
import type { ProductFilterProps } from './types';

const ProductFilter: React.FC< ProductFilterProps > = ( { filterType, setFilterType } ) => {
	const translate = useTranslate();

	return (
		<div className="jetpack-product-store__product-filter">
			<SegmentedControl className="jetpack-product-store__product-filter-toggle" compact primary>
				<SegmentedControl.Item
					onClick={ () => setFilterType( 'products' ) }
					selected={ filterType === 'products' }
				>
					{ translate( 'Products' ) }
				</SegmentedControl.Item>

				<SegmentedControl.Item
					onClick={ () => setFilterType( 'bundles' ) }
					selected={ filterType === 'bundles' }
				>
					{ translate( 'Bundles' ) }
				</SegmentedControl.Item>
			</SegmentedControl>
		</div>
	);
};

export default ProductFilter;
