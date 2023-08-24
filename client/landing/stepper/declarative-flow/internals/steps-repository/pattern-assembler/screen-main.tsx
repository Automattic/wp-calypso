import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { NavigatorHeader, NavigatorItem, NavigatorItemGroup } from '@automattic/onboarding';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { focus } from '@wordpress/dom';
import { header, footer, layout } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
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
	onMainItemSelect: ( name: string ) => void;
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
	recordTracksEvent,
	surveyDismissed,
	setSurveyDismissed,
	selectedMainItem,
	selectedSections,
	selectedHeader,
	selectedFooter,
	updateActivePatternPosition,
	categories,
	patternsMapByCategory,
}: Props ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const navigator = useNavigator();
	const { location } = navigator;
	const isInitialLocation = location.isInitial && ! location.isBack;
	const headerDescription = translate(
		'Create your homepage by first adding patterns and then choosing a color palette and font style.'
	);
	const isButtonDisabled = ! selectedHeader && ! selectedFooter && ! selectedSections.length;

	const handleClick = () => {
		if ( ! isButtonDisabled ) {
			navigator.goTo( NAVIGATOR_PATHS.STYLES );
			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CONTINUE_TO_STYLES_CLICK );
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

	useEffect( () => {
		if ( selectedMainItem !== 'header' ) {
			// Open Header initially
			setTimeout( () => onMainItemSelect( 'header' ), 250 );
		}
	}, [] );

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
							aria-label={ translate( 'Header' ) }
							onClick={ () => onMainItemSelect( 'header' ) }
							active={ getIsActiveButton( 'header' ) }
						>
							{ translate( 'Header' ) }
						</NavigatorItem>
						<NavigatorItem
							checked={ Boolean( selectedSections.length ) }
							icon={ layout }
							aria-label={ translate( 'Sections' ) }
							onClick={ () => onMainItemSelect( 'section' ) }
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
							aria-label={ translate( 'Footer' ) }
							onClick={ () => onMainItemSelect( 'footer' ) }
							active={ getIsActiveButton( 'footer' ) }
						>
							{ translate( 'Footer' ) }
						</NavigatorItem>
					</NavigatorItemGroup>
				</VStack>
				{ ! surveyDismissed && <Survey setSurveyDismissed={ setSurveyDismissed } /> }
			</div>
			<div className="screen-container__footer">
				<Button
					className="pattern-assembler__button"
					aria-disabled={ isButtonDisabled }
					onClick={ handleClick }
					label="Add your first pattern to get started."
					showTooltip={ isButtonDisabled }
					variant="primary"
				>
					{ isEnglishLocale || i18n.hasTranslation( 'Pick your style' )
						? translate( 'Pick your style' )
						: translate( 'Save and continue' ) }
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
