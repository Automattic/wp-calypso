import { ResponsiveToolbarGroup } from '@automattic/components';
import type { Category } from '../../types';
import type { ReactElement } from 'react';
import './style.scss';

interface Props {
	categories: Category[];
	onSelect: ( selectedSlug: string | null ) => void;
}

export function UnifiedDesignPickerCategoryFilter( {
	categories,
	onSelect,
}: Props ): ReactElement | null {
	const onClick = ( index: number ) => {
		const category = categories[ index ];
		onSelect( category?.slug );
	};

	return (
		<div className="unified-design-picker-category-filter">
			<ResponsiveToolbarGroup initialActiveIndex={ 0 } onClick={ onClick }>
				{ categories.map( ( category ) => (
					<span key={ `category-${ category.slug }` }>{ category.name }</span>
				) ) }
			</ResponsiveToolbarGroup>
		</div>
	);
}
