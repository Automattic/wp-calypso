import { Button } from '@automattic/components';
import { __experimentalNavigatorBackButton as NavigatorBackButton } from '@wordpress/components';
import { Icon, chevronRight } from '@wordpress/icons';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import useCategoriesOrder from './hooks/use-categories-order';
import NavigatorHeader from './navigator-header';
import PatternListPanel from './pattern-list-panel';
import type { Pattern, Category } from './types';
import './screen-category-list.scss';

interface Props {
	categories: Category[];
	patternsMapByCategory: { [ key: string ]: Pattern[] };
	onDoneClick: () => void;
	onSelect: (
		type: string,
		selectedPattern: Pattern | null,
		selectedCategory: string | null
	) => void;
	replacePatternMode: boolean;
	selectedPattern: Pattern | null;
	wrapperRef: React.RefObject< HTMLDivElement > | null;
	onTogglePatternPanelList?: ( isOpen: boolean ) => void;
	recordTracksEvent: ( name: string, eventProperties: any ) => void;
}

const ScreenCategoryList = ( {
	patternsMapByCategory,
	categories,
	onDoneClick,
	replacePatternMode,
	onSelect,
	selectedPattern,
	wrapperRef,
	onTogglePatternPanelList,
	recordTracksEvent,
}: Props ) => {
	const translate = useTranslate();
	const [ selectedCategory, setSelectedCategory ] = useState< string | null >( null );
	const categoriesInOrder = useCategoriesOrder( categories );

	const handleFocusOutside = ( event: Event ) => {
		// Click on large preview but not action bar to close Pattern List
		const target = event.target as HTMLElement;
		if ( ! target.closest( '.pattern-action-bar' ) && target.closest( '.pattern-large-preview' ) ) {
			setSelectedCategory( null );
			onTogglePatternPanelList?.( false );
		}
	};

	const trackEventCategoryClick = ( name: string ) => {
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_CATEGORY_LIST_CATEGORY_CLICK, {
			pattern_category: name,
		} );
	};

	useEffect( () => {
		wrapperRef?.current?.addEventListener( 'click', handleFocusOutside );
		return () => {
			wrapperRef?.current?.removeEventListener( 'click', handleFocusOutside );
		};
	}, [] );

	useEffect( () => {
		// Notify the pattern panel list is going to close when umount
		return () => {
			onTogglePatternPanelList?.( false );
		};
	}, [] );

	return (
		<div className="screen-container">
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
			<div className="screen-container__body screen-container__body--align-sides screen-category-list__body">
				{ categoriesInOrder.map( ( { name, label, description } ) => {
					const isOpen = selectedCategory === name;
					const hasPatterns = name && patternsMapByCategory[ name ]?.length;
					const isHeaderCategory = name === 'header';
					const isFooterCategory = name === 'footer';

					if ( ! hasPatterns || isHeaderCategory || isFooterCategory ) {
						return null;
					}

					return (
						<Button
							key={ name }
							className={ classNames( 'screen-category-list__category-button navigator-button', {
								'screen-category-list__category-button--is-open': isOpen,
							} ) }
							title={ description }
							onClick={ () => {
								if ( isOpen ) {
									setSelectedCategory( null );
									onTogglePatternPanelList?.( false );
								} else {
									setSelectedCategory( name );
									onTogglePatternPanelList?.( true );
									trackEventCategoryClick( name );
								}
							} }
						>
							<span>{ label }</span>
							<Icon icon={ chevronRight } size={ 24 } />
						</Button>
					);
				} ) }
			</div>
			<div className="screen-container__footer">
				<NavigatorBackButton
					as={ Button }
					className="pattern-assembler__button"
					primary
					onClick={ () => {
						onDoneClick();
					} }
				>
					{ translate( 'Save' ) }
				</NavigatorBackButton>
			</div>
			<PatternListPanel
				onSelect={ ( selectedPattern: Pattern | null ) =>
					onSelect( 'section', selectedPattern, selectedCategory )
				}
				selectedPattern={ selectedPattern }
				selectedCategory={ selectedCategory }
				categories={ categories }
				patternsMapByCategory={ patternsMapByCategory }
			/>
		</div>
	);
};

export default ScreenCategoryList;
