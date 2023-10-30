import { Gridicon } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
	__unstableCompositeItem as CompositeItem,
	FlexItem,
} from '@wordpress/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ORDERED_PATTERN_PAGES_CATEGORIES } from './constants';
import { useCategoriesOrder } from './hooks';
import type { Category, Pattern } from './types';
import './pattern-page-list.scss';

interface PatternPageListItemProps {
	label?: string;
	isSelected?: boolean;
	isDisabled?: boolean;
}

const PatternPageListItem = ( { label, isSelected, isDisabled }: PatternPageListItemProps ) => {
	return (
		<HStack
			className={ classnames( 'pattern-page-list-item', {
				'pattern-page-list-item--selected': isSelected,
				'pattern-page-list-item--disabled': isDisabled,
			} ) }
			justify="flex-start"
			spacing={ 3 }
		>
			<FlexItem className="pattern-page-list-item__icon" display="flex">
				{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
				<Gridicon icon="checkmark" size={ 10 } />
			</FlexItem>
			<FlexItem className="pattern-page-list-item__label">{ label }</FlexItem>
		</HStack>
	);
};

interface PatternPageListProps {
	categories: Category[];
	pagesMapByCategory: Record< string, Pattern[] >;
	selectedPages: string[];
	onSelectPage: ( selectedPage: string ) => void;
}

const PatternPageList = ( {
	categories,
	pagesMapByCategory,
	selectedPages,
	onSelectPage,
}: PatternPageListProps ) => {
	const translate = useTranslate();
	const categoriesInOrder = useCategoriesOrder( categories, ORDERED_PATTERN_PAGES_CATEGORIES );
	const composite = useCompositeState( { orientation: 'vertical' } );

	return (
		<Composite
			{ ...composite }
			role="listbox"
			className="pattern-page-list"
			aria-label={ translate( 'Pages' ) }
		>
			<VStack spacing={ 0 }>
				<CompositeItem
					{ ...composite }
					role="checkbox"
					as="button"
					disabled={ true }
					focusable={ true }
					aria-checked="true"
				>
					<PatternPageListItem label={ translate( 'Homepage' ) } isDisabled />
				</CompositeItem>
				{ categoriesInOrder.map( ( { name, label } ) => {
					const isSelected = name ? selectedPages.includes( name ) : false;
					const hasPages = name && pagesMapByCategory[ name ]?.length;

					if ( ! hasPages ) {
						return null;
					}

					return (
						<CompositeItem
							{ ...composite }
							key={ name }
							role="checkbox"
							as="button"
							aria-checked={ isSelected }
							onClick={ () => onSelectPage( name ) }
						>
							<PatternPageListItem
								label={ label }
								isSelected={ isSelected }
							/>
						</CompositeItem>
					);
				} ) }
			</VStack>
		</Composite>
	);
};

export default PatternPageList;
