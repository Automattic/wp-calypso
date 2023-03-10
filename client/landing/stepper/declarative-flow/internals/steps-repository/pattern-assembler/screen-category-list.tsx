import { Button } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { __experimentalUseFocusOutside as useFocusOutside } from '@wordpress/compose';
import { Icon, chevronRight } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import useCategoriesOrder from './hooks/use-categories-order';
import NavigatorHeader from './navigator-header';
import PatternListPanel from './pattern-list-panel';
import { useSectionPatterns } from './patterns-data';
import type { Pattern, Category } from './types';
import './screen-category-list.scss';

interface Props {
	categories: Category[];
	sectionsMapByCategory: { [ key: string ]: Pattern[] };
	onDoneClick: () => void;
	onSelect: (
		type: string,
		selectedPattern: Pattern | null,
		selectedCategory: string | null
	) => void;
	replacePatternMode: boolean;
	selectedPattern: Pattern | null;
	wrapperRef: React.RefObject< HTMLDivElement > | null;
}

const ScreenCategoryList = ( {
	sectionsMapByCategory,
	categories,
	onDoneClick,
	replacePatternMode,
	onSelect,
	selectedPattern,
	wrapperRef,
}: Props ) => {
	const translate = useTranslate();
	const [ selectedCategory, setSelectedCategory ] = useState< string | null >( null );
	const [ openPatternList, setOpenPatternList ] = useState< boolean | null >( null );
	const sectionPatterns = useSectionPatterns();
	const categoriesInOrder = useCategoriesOrder( categories );

	const handleFocusOutside = () => {
		setOpenPatternList( false );
		setSelectedCategory( null );
	};

	return (
		<div className="screen-container" { ...useFocusOutside( handleFocusOutside ) }>
			<NavigatorHeader
				title={ replacePatternMode ? translate( 'Replace pattern' ) : translate( 'Add patterns' ) }
				description={
					replacePatternMode
						? translate(
								'Replace the selected pattern by choosing from the list of categories below.'
						  )
						: translate(
								'Find the right patterns for you by exploring the list of categories below.'
						  )
				}
			/>
			<div className="screen-container__body screen-category-list__body">
				{ categoriesInOrder.map( ( { name, label, description } ) => {
					const isOpen = selectedCategory === name;
					const hasPatterns = sectionsMapByCategory[ name ]?.length;

					if ( ! hasPatterns ) {
						return null;
					}

					return (
						<Button
							key={ name }
							className={ classNames( 'screen-category-list__category-button', {
								'screen-category-list__category-button--is-open': isOpen,
							} ) }
							title={ description }
							onClick={ () => {
								if ( isOpen ) {
									setOpenPatternList( false );
									setSelectedCategory( null );
								} else if ( ! openPatternList ) {
									setOpenPatternList( true );
									// Delay to prioritize the start of the panel animation
									setTimeout( () => setSelectedCategory( name ), 200 );
								} else {
									setSelectedCategory( name );
								}
							} }
						>
							<span>{ label }</span>
							<Icon icon={ chevronRight } size={ 22 } />
						</Button>
					);
				} ) }
			</div>
			<div className="screen-container__footer">
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					onClick={ () => {
						onDoneClick();
					} }
					primary
				>
					{ translate( 'Done' ) }
				</NavigatorBackButton>
			</div>
			{ createPortal(
				<PatternListPanel
					onSelect={ ( selectedPattern ) =>
						onSelect( 'section', selectedPattern, selectedCategory )
					}
					selectedPattern={ selectedPattern }
					patterns={ sectionPatterns }
					openPatternList={ openPatternList }
					selectedCategory={ selectedCategory }
					categories={ categories }
				/>,
				// Using the pattern-assembler__wrapper as parent
				// because the panel must slide from behind the sidebar
				wrapperRef?.current as HTMLDivElement
			) }
		</div>
	);
};

export default ScreenCategoryList;
