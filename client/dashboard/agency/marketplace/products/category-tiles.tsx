import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	Icon,
	category as allIcon,
	commentAuthorName,
	currencyDollar,
	lock,
	moreHorizontal,
	next,
	people,
	percent,
	postContent,
	shipping,
	siteLogo,
	store,
	trendingUp,
} from '@wordpress/icons';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import SpotTiles from '../../components/showcase/spot-tiles';
import jetpackMark from './images/brand-jetpack.svg';
import wooMark from './images/brand-woo.svg';
import { getBrandLabels, getCategoryShortLabels } from './lib/product-categories';
import type { ProductBrand, ProductCategory } from './lib/product-categories';

export const CATEGORY_ICONS: Record< ProductCategory, JSX.Element > = {
	payments: currencyDollar,
	security: lock,
	performance: next,
	social: people,
	growth: trendingUp,
	shipping,
	conversion: percent,
	'customer-service': commentAuthorName,
	merchandising: siteLogo,
	'store-content': postContent,
	'store-management': store,
};

const BRAND_MARKS: Record< ProductBrand, string > = {
	jetpack: jetpackMark,
	woocommerce: wooMark,
	pressable: pressableIcon,
};

function brandMark( brand: ProductBrand, size: number ) {
	return <img src={ BRAND_MARKS[ brand ] } width={ size } height={ size } alt="" />;
}

const BRANDS: ProductBrand[] = [ 'jetpack', 'woocommerce', 'pressable' ];

export type TileValue = ProductBrand | ProductCategory;

export function isProductCategory( value: unknown ): value is ProductCategory {
	return typeof value === 'string' && Object.keys( CATEGORY_ICONS ).includes( value );
}

export function isProductBrand( value: unknown ): value is ProductBrand {
	return typeof value === 'string' && BRANDS.includes( value as ProductBrand );
}

export const isTileValue = ( value: unknown ): value is TileValue =>
	isProductCategory( value ) || isProductBrand( value );

export function CategoryMark( { section }: { section: TileValue | 'other' } ) {
	return (
		<HStack expanded={ false } className="dashboard-marketplace-products__section-mark">
			{ isProductBrand( section ) ? (
				brandMark( section, 24 )
			) : (
				<Icon
					icon={ section === 'other' ? moreHorizontal : CATEGORY_ICONS[ section ] }
					size={ 24 }
				/>
			) }
		</HStack>
	);
}

export default function CategoryTiles( {
	selected,
	onSelect,
	lead,
	brands,
}: {
	selected: TileValue | null;
	/** The brands the list has products for; a brand with none gets no tile. */
	brands: ProductBrand[];
	lead: React.ReactNode;
	onSelect: ( value: TileValue | null ) => void;
} ) {
	const labels = getCategoryShortLabels();
	const brandLabels = getBrandLabels();
	return (
		<SpotTiles< TileValue >
			label={ __( 'Brands and categories' ) }
			arrowLabels={ {
				previous: __( 'Previous categories' ),
				next: __( 'Next categories' ),
			} }
			selected={ selected }
			onSelect={ onSelect }
			lead={ lead }
			all={ { label: __( 'All categories' ), icon: allIcon } }
			options={ [
				...BRANDS.filter( ( brand ) => brands.includes( brand ) ).map( ( brand ) => ( {
					value: brand,
					label: brandLabels[ brand ],
					mark: brandMark( brand, 32 ),
				} ) ),
				...( Object.keys( CATEGORY_ICONS ) as ProductCategory[] ).map( ( category, index ) => ( {
					value: category,
					label: labels[ category ],
					icon: CATEGORY_ICONS[ category ],
					startsGroup: index === 0,
				} ) ),
			] }
		/>
	);
}
