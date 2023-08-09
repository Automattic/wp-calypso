import {
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
	__unstableCompositeItem as CompositeItem,
} from '@wordpress/components';
import { Icon, chevronRight } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import useCategoriesOrder from './hooks/use-categories-order';
import type { Pattern, Category } from './types';
import './pattern-category-list.scss';

interface Props {
	categories: Category[];
	patternsMapByCategory: { [ key: string ]: Pattern[] };
	selectedCategory: string;
	onSelectCategory: ( selectedCategory: string ) => void;
}

const PatternCategoryList = ( {
	categories,
	patternsMapByCategory,
	selectedCategory,
	onSelectCategory,
}: Props ) => {
	const translate = useTranslate();
	const categoriesInOrder = useCategoriesOrder( categories );
	const composite = useCompositeState( { orientation: 'vertical' } );

	return (
		<Composite
			{ ...composite }
			role="listbox"
			className="screen-container__body pattern-category-list__body"
			aria-label={ translate( 'Block pattern categories' ) }
		>
			{ categoriesInOrder.map( ( { name, label, description } ) => {
				const isOpen = selectedCategory === name;
				const hasPatterns = name && patternsMapByCategory[ name ]?.length;
				const isHeaderCategory = name === 'header';
				const isFooterCategory = name === 'footer';

				if ( ! hasPatterns || isHeaderCategory || isFooterCategory ) {
					return null;
				}

				return (
					<CompositeItem
						key={ name }
						role="option"
						as="button"
						{ ...composite }
						className={ classNames(
							'components-navigator-button',
							'navigator-button',
							'pattern-category-list__category-button',
							{
								'navigator-button--is-active': isOpen,
							}
						) }
						aria-label={ label }
						aria-describedby={ description }
						aria-current={ isOpen }
						onClick={ () => {
							if ( ! isOpen ) {
								onSelectCategory( name );
							}
						} }
					>
						<span>{ label }</span>
						<Icon className="pattern-category-list__arrow-icon" icon={ chevronRight } size={ 24 } />
					</CompositeItem>
				);
			} ) }
		</Composite>
	);
};

export default PatternCategoryList;
