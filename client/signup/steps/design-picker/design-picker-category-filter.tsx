import {
	NavigableMenu,
	MenuItem as _MenuItem,
	VisuallyHidden,
	Button,
} from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import type { Category } from '@automattic/design-picker';
import type { ComponentProps, ComponentType, ReactNode } from 'react';
import './design-picker-category-filter.scss';

interface Props {
	categories: Category[];
	onSelect: ( selectedSlug: string | null ) => void;
	selectedCategory: string | null;
	recommendedCategorySlug: string | null;
	heading?: ReactNode;
	footer?: ReactNode;
}

// TODO: Remove this wrapper when MenuItem adds back button prop types
type MenuItemProps = ComponentProps< typeof _MenuItem >;
const MenuItem = _MenuItem as ComponentType<
	MenuItemProps & {
		variant?: ComponentProps< typeof Button >[ 'variant' ];
		isPressed?: boolean;
	}
>;

export function DesignPickerCategoryFilter( {
	categories,
	onSelect,
	selectedCategory,
	heading,
	footer,
	recommendedCategorySlug,
}: Props ) {
	const instanceId = useInstanceId( DesignPickerCategoryFilter );
	const translate = useTranslate();

	return (
		<div className="design-picker-category-filter">
			{ heading }
			<VisuallyHidden as="h2" id={ `design-picker__category-heading-${ instanceId }` }>
				{ translate( 'Design categories' ) }
			</VisuallyHidden>

			{ /* Shown on smaller displays */ }
			<select
				className="design-picker-category-filter__dropdown"
				value={ selectedCategory || '' }
				onChange={ ( e ) => onSelect( e.currentTarget.value ) }
			>
				{ categories.map( ( { slug, name } ) => (
					<option key={ slug } value={ slug }>
						{ name }
					</option>
				) ) }
			</select>

			{ /* Shown on larger displays */ }
			<NavigableMenu
				aria-labelledby={ `design-picker__category-heading-${ instanceId }` }
				onNavigate={ ( _index, child ) => onSelect( child.dataset.slug ?? null ) }
				orientation="vertical"
				className="design-picker-category-filter__sidebar"
			>
				{ categories.map( ( { slug, name } ) => (
					<MenuItem
						key={ slug }
						variant="tertiary"
						isPressed={ slug === selectedCategory }
						data-slug={ slug }
						onClick={ () => onSelect( slug ) }
						tabIndex={ slug === selectedCategory ? undefined : -1 }
						className="design-picker-category-filter__menu-item"
					>
						<span className="design-picker-category-filter__item-name">{ name }</span>{ ' ' }
						{ recommendedCategorySlug === slug && (
							<span className="design-picker-category-filter__recommended-badge">
								{ translate( 'Recommended' ) }
							</span>
						) }
					</MenuItem>
				) ) }
			</NavigableMenu>
			{ footer }
		</div>
	);
}
