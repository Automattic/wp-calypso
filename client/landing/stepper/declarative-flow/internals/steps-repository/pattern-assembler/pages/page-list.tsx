import { Gridicon } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__unstableComposite as Composite,
	__unstableUseCompositeState as useCompositeState,
	__unstableCompositeItem as CompositeItem,
	FlexItem,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import './page-list.scss';

interface PageListItemProps {
	label?: string;
	isSelected?: boolean;
	isDisabled?: boolean;
}

const PageListItem = ( { label, isSelected, isDisabled }: PageListItemProps ) => {
	return (
		<HStack
			className={ clsx( 'page-list-item', {
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
	pagesToShow: any[];
	onSelectPage: ( selectedPage: string ) => void;
}

const PageList = ( { pagesToShow, onSelectPage }: PageListProps ) => {
	const translate = useTranslate();

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
					disabled
					focusable
					aria-checked="true"
				>
					<PageListItem label={ translate( 'Homepage' ) } isDisabled />
				</CompositeItem>
				{ pagesToShow.map( ( page ) => {
					return (
						<CompositeItem
							{ ...composite }
							key={ page.name }
							role="checkbox"
							as="button"
							aria-checked={ page.isSelected }
							onClick={ () => onSelectPage( page.name ) }
						>
							<PageListItem label={ page.title } isSelected={ page.isSelected } />
						</CompositeItem>
					);
				} ) }
			</VStack>
		</Composite>
	);
};

export default PageList;
