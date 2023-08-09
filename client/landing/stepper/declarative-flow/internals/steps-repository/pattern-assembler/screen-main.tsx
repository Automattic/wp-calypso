import { Button } from '@automattic/components';
import {
	NavigatorButtonAsItem,
	NavigatorHeader,
	NavigatorItem,
	NavigatorItemGroup,
} from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { focus } from '@wordpress/dom';
import { header, footer, layout, color, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef } from 'react';
import { CATEGORY_ALL_SLUG, NAVIGATOR_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import NavigatorTitle from './navigator-title';
import PatternCategoryList from './pattern-category-list';
import PatternListPanel from './pattern-list-panel';
import Survey from './survey';
import { Pattern, Category } from './types';
import { replaceCategoryAllName } from './utils';

interface Props {
	onSelect: (
		type: string,
		selectedPattern: Pattern | null,
		selectedCategory: string | null
	) => void;
	onMainItemSelect: ( { name, isPanel }: { name: string; isPanel?: boolean } ) => void;
	onContinueClick: ( callback?: () => void ) => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
	surveyDismissed: boolean;
	setSurveyDismissed: ( dismissed: boolean ) => void;
	selectedMainItem: string | null;
	selectedSections: Pattern[];
	selectedHeader: Pattern | null;
	selectedFooter: Pattern | null;
	hasColor: boolean;
	hasFont: boolean;
	updateActivePatternPosition: () => void;
	categories: Category[];
	patternsMapByCategory: { [ key: string ]: Pattern[] };
}

const ScreenMain = ( {
	onSelect,
	onMainItemSelect,
	onContinueClick,
	recordTracksEvent,
	surveyDismissed,
	setSurveyDismissed,
	selectedMainItem,
	selectedSections,
	selectedHeader,
	selectedFooter,
	hasColor,
	hasFont,
	updateActivePatternPosition,
	categories,
	patternsMapByCategory,
}: Props ) => {
	const translate = useTranslate();
	const [ disabled, setDisabled ] = useState( true );
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const { location } = useNavigator();
	const isInitialLocation = location.isInitial && ! location.isBack;
	const headerDescription = translate(
		'Create your homepage by first adding patterns and then choosing a color palette and font style.'
	);

	// Use the mousedown event to prevent either the button focusing or text selection
	const handleMouseDown = ( event: React.MouseEvent ) => {
		if ( disabled ) {
			event.preventDefault();
			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CONTINUE_MISCLICK );
		}
	};

	const handleClick = () => {
		if ( ! disabled ) {
			onContinueClick();
		}
	};

	const [ selectedSectionCategory, setSelectedSectionCategory ] = useState( CATEGORY_ALL_SLUG );
	const onSelectSectionCategory = ( category: string ) => {
		setSelectedSectionCategory( category );
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CATEGORY_LIST_CATEGORY_CLICK, {
			pattern_category: replaceCategoryAllName( category ),
		} );
	};

	const getSelectedPattern = () => {
		if ( 'header' === selectedMainItem ) {
			return selectedHeader;
		}
		if ( 'footer' === selectedMainItem ) {
			return selectedFooter;
		}
		return null;
	};

	const getSelectedPatterns = () => {
		if ( 'section' === selectedMainItem ) {
			return selectedSections;
		}
	};

	const getLabel = () => {
		if ( 'header' === selectedMainItem ) {
			return translate( 'Header' );
		}
		if ( 'footer' === selectedMainItem ) {
			return translate( 'Footer' );
		}
	};

	const getDescription = () => {
		if ( 'header' === selectedMainItem ) {
			return translate(
				'Pick the header that appears at the top of every page and shows your site logo, title and navigation.'
			);
		}
		if ( 'footer' === selectedMainItem ) {
			return translate(
				'Pick the footer that appears at the bottom of every page and shows useful links and contact information.'
			);
		}
	};

	const getIsActiveButton = ( name: string ) => {
		return name === selectedMainItem;
	};

	// Set a delay to enable the Continue button since the user might mis-click easily when they go back from another screen
	useEffect( () => {
		const timeoutId = window.setTimeout( () => setDisabled( false ), 300 );
		return () => {
			window.clearTimeout( timeoutId );
		};
	}, [] );

	useEffect( () => {
		if ( ! isInitialLocation || ! wrapperRef.current ) {
			return;
		}

		const activeElement = wrapperRef.current.ownerDocument.activeElement;
		if ( wrapperRef.current.contains( activeElement ) ) {
			return;
		}

		const firstTabbable = ( focus.tabbable.find( wrapperRef.current ) as HTMLElement[] )[ 0 ];
		const elementToFocus = firstTabbable ?? wrapperRef.current;
		elementToFocus.focus();
	}, [ isInitialLocation ] );

	useEffect( () => {
		updateActivePatternPosition();
	}, [ updateActivePatternPosition ] );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Design your own' ) } /> }
				description={ headerDescription }
				hideBack
			/>
			<div className="screen-container__body" ref={ wrapperRef }>
				<VStack spacing="4">
					<NavigatorItemGroup title={ translate( 'Patterns' ) }>
						<NavigatorItem
							checked={ Boolean( selectedHeader ) }
							icon={ header }
							aria-label={ translate( 'Add header' ) }
							onClick={ () => onMainItemSelect( { name: 'header', isPanel: true } ) }
							active={ getIsActiveButton( 'header' ) }
						>
							{ translate( 'Header' ) }
						</NavigatorItem>
						<NavigatorItem
							checked={ Boolean( selectedSections.length ) }
							icon={ layout }
							aria-label={ translate( 'Add sections' ) }
							onClick={ () => onMainItemSelect( { name: 'section', isPanel: true } ) }
							active={ getIsActiveButton( 'section' ) }
							hasNestedItems
						>
							{ translate( 'Sections' ) }
						</NavigatorItem>

						{ selectedMainItem === 'section' && (
							<PatternCategoryList
								categories={ categories }
								patternsMapByCategory={ patternsMapByCategory }
								selectedCategory={ selectedSectionCategory }
								onSelectCategory={ onSelectSectionCategory }
							/>
						) }

						<NavigatorItem
							checked={ Boolean( selectedFooter ) }
							icon={ footer }
							aria-label={ translate( 'Add footer' ) }
							onClick={ () => onMainItemSelect( { name: 'footer', isPanel: true } ) }
							active={ getIsActiveButton( 'footer' ) }
						>
							{ translate( 'Footer' ) }
						</NavigatorItem>
					</NavigatorItemGroup>
					<NavigatorItemGroup title={ translate( 'Styles' ) }>
						<>
							<NavigatorButtonAsItem
								checked={ hasColor }
								path={ NAVIGATOR_PATHS.COLOR_PALETTES }
								icon={ color }
								aria-label={ translate( 'Colors' ) }
								onClick={ () => onMainItemSelect( { name: 'color-palettes' } ) }
							>
								{ translate( 'Colors' ) }
							</NavigatorButtonAsItem>
							<NavigatorButtonAsItem
								checked={ hasFont }
								path={ NAVIGATOR_PATHS.FONT_PAIRINGS }
								icon={ typography }
								aria-label={ translate( 'Fonts' ) }
								onClick={ () => onMainItemSelect( { name: 'font-pairings' } ) }
							>
								{ translate( 'Fonts' ) }
							</NavigatorButtonAsItem>
						</>
					</NavigatorItemGroup>
				</VStack>
				{ ! surveyDismissed && <Survey setSurveyDismissed={ setSurveyDismissed } /> }
			</div>
			<div className="screen-container__footer">
				<Button
					className="pattern-assembler__button"
					primary
					aria-disabled={ disabled }
					onMouseDown={ handleMouseDown }
					onClick={ handleClick }
				>
					{ translate( 'Save and continue' ) }
				</Button>
			</div>
			{ selectedMainItem && (
				<PatternListPanel
					onSelect={ ( selectedPattern: Pattern | null ) =>
						onSelect( selectedMainItem, selectedPattern, selectedMainItem )
					}
					selectedPattern={ getSelectedPattern() }
					selectedPatterns={ getSelectedPatterns() }
					label={ getLabel() }
					description={ getDescription() }
					selectedCategory={
						selectedMainItem === 'section' ? selectedSectionCategory : selectedMainItem
					}
					categories={ categories }
					patternsMapByCategory={ patternsMapByCategory }
				/>
			) }
		</>
	);
};

export default ScreenMain;
