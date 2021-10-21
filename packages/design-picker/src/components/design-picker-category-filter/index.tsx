import { NavigableMenu, MenuItem, VisuallyHidden } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import type { Category } from '../../types';
import type { ReactElement } from 'react';
import './style.scss';

interface Props {
	categories: Category[];
	onSelect: ( selectedSlug: string | null ) => void;
	selectedCategory: string | null;
}

export function DesignPickerCategoryFilter( {
	categories,
	onSelect,
	selectedCategory,
}: Props ): ReactElement | null {
	const instanceId = useInstanceId( DesignPickerCategoryFilter );
	const { __ } = useI18n();

	return (
		<div className="design-picker-category-filter">
			<VisuallyHidden as="h2" id={ `design-picker__category-heading-${ instanceId }` }>
				{ __( 'Design categories', __i18n_text_domain__ ) }
			</VisuallyHidden>
			<NavigableMenu
				aria-labelledby={ `design-picker__category-heading-${ instanceId }` }
				onNavigate={ ( _index, child ) => onSelect( child.dataset.slug ?? null ) }
				orientation="vertical"
			>
				{ categories.map( ( { slug, name } ) => (
					<MenuItem
						key={ slug }
						isTertiary
						aria-selected={ slug === selectedCategory }
						data-slug={ slug }
						onClick={ () => onSelect( slug ) }
						tabIndex={ slug === selectedCategory ? undefined : -1 }
					>
						{ name }
					</MenuItem>
				) ) }
			</NavigableMenu>
		</div>
	);
}
