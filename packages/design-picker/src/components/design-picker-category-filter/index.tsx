import { ResponsiveToolbarGroup } from '@automattic/components';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks'; // eslint-disable-line no-restricted-imports
import type { Category } from '../../types';
import './style.scss';

interface Props {
	className: string;
	categories: Category[];
	selectedSlug: string | null;
	onSelect: ( selectedSlug: string | null ) => void;
}

export default function DesignPickerCategoryFilter( {
	className,
	categories,
	onSelect,
	selectedSlug,
}: Props ) {
	const onClick = ( index: number ) => {
		const category = categories[ index ];

		recordTracksEvent( 'calypso_signup_unified_design_select_category', {
			category: category?.slug,
		} );

		onSelect( category?.slug );
	};
	const initialActiveIndex = categories.findIndex( ( { slug } ) => slug === selectedSlug );
	return (
		<ResponsiveToolbarGroup
			className={ className }
			initialActiveIndex={ initialActiveIndex !== -1 ? initialActiveIndex : 0 }
			onClick={ onClick }
		>
			{ categories.map( ( category ) => (
				<span key={ `category-${ category.slug }` }>{ category.name }</span>
			) ) }
		</ResponsiveToolbarGroup>
	);
}
