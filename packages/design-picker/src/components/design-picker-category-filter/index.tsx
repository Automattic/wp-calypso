import { ResponsiveToolbarGroup } from '@automattic/components';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks'; // eslint-disable-line no-restricted-imports
import type { Category } from '../../types';
import './style.scss';

interface Props {
	className: string;
	categories: Category[];
	selectedSlugs: string[];
	isMultiSelection?: boolean;
	onSelect: ( selectedSlug: string ) => void;
}

export default function DesignPickerCategoryFilter( {
	className,
	categories,
	selectedSlugs,
	isMultiSelection,
	onSelect,
}: Props ) {
	const onClick = ( index: number ) => {
		const category = categories[ index ];
		if ( category?.slug ) {
			recordTracksEvent( 'calypso_signup_unified_design_select_category', {
				category: category?.slug,
			} );

			onSelect( category.slug );
		}
	};

	const selectedSlugsSet = new Set( selectedSlugs );
	const initialActiveIndex = categories.findIndex( ( { slug } ) => selectedSlugsSet.has( slug ) );
	const initialActiveIndexes = categories
		.map( ( { slug }, index ) => ( selectedSlugsSet.has( slug ) ? index : -1 ) )
		.filter( ( index ) => index >= 0 );
	return (
		<ResponsiveToolbarGroup
			className={ className }
			initialActiveIndex={ initialActiveIndex !== -1 ? initialActiveIndex : 0 }
			initialActiveIndexes={ initialActiveIndexes }
			isMultiSelection={ isMultiSelection }
			onClick={ onClick }
		>
			{ categories.map( ( category ) => (
				<span key={ `category-${ category.slug }` }>{ category.name }</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
}
