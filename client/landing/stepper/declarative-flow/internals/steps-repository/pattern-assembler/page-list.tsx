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
import { usePagesOrder } from './hooks';
import type { Pattern } from './types';
import './page-list.scss';

interface PageListItemProps {
	label: string;
	isSelected?: boolean;
	isDisabled?: boolean;
}

const PageListItem = ( { label, isSelected, isDisabled }: PageListItemProps ) => {
	return (
		<HStack
			className={ classnames( 'page-list-item', {
				'page-list-item--selected': isSelected,
				'page-list-item--disabled': isDisabled,
			} ) }
			justify="flex-start"
			spacing={ 3 }
		>
			<FlexItem className="page-list-item__icon" display="flex">
				{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
				<Gridicon icon="checkmark" size={ 10 } />
			</FlexItem>
			<FlexItem className="page-list-item__label">{ label }</FlexItem>
		</HStack>
	);
};

interface PageListProps {
	categories: Category[];
	pagesMapByCategory: Record< string, Pattern[] >;
	selectedPages: string[];
	onSelectPage: ( selectedPage: string ) => void;
}

const PageList = ( {
	categories,
	pagesMapByCategory,
	selectedPages,
	onSelectPage,
}: PageListProps ) => {
	const translate = useTranslate();
	const categoriesInOrder = usePagesOrder( categories );
	const composite = useCompositeState( { orientation: 'vertical' } );

	return (
		<Composite
			{ ...composite }
			role="listbox"
			className="page-list"
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
					<PageListItem label={ translate( 'Homepage' ) } isDisabled />
				</CompositeItem>
				{ categoriesInOrder.map( ( { name, label } ) => {
					const isSelected = selectedPages.includes( name );
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
							<PageListItem label={ label } isSelected={ isSelected } />
						</CompositeItem>
					);
				} ) }
			</VStack>
		</Composite>
	);
};

export default PageList;
