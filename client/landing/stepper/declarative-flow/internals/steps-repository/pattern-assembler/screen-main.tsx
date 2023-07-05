import { Button } from '@automattic/components';
import {
	NavigationButtonAsItem,
	NavigatorHeader,
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
import { NAVIGATOR_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import NavigatorTitle from './navigator-title';
import PatternListPanel from './pattern-list-panel';
import Survey from './survey';
import { Pattern, Category } from './types';

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
	hasSections: boolean;
	hasHeader: boolean;
	hasFooter: boolean;
	hasColor: boolean;
	hasFont: boolean;
	selectedMainItem: string | null;
	selectedHeader: Pattern | null;
	selectedFooter: Pattern | null;
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
	hasSections,
	hasHeader,
	hasFooter,
	hasColor,
	hasFont,
	selectedMainItem,
	selectedHeader,
	selectedFooter,
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

	const getSelectedPattern = () => {
		if ( 'header' === selectedMainItem ) {
			return selectedHeader;
		}
		if ( 'footer' === selectedMainItem ) {
			return selectedFooter;
		}
		return null;
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
						<NavigationButtonAsItem
							checked={ hasHeader }
							path={ NAVIGATOR_PATHS.MAIN }
							icon={ header }
							aria-label={ translate( 'Add header' ) }
							onClick={ () => onMainItemSelect( { name: 'header', isPanel: true } ) }
							active={ getIsActiveButton( 'header' ) }
						>
							{ translate( 'Header' ) }
						</NavigationButtonAsItem>
						<NavigationButtonAsItem
							checked={ hasSections }
							path={ NAVIGATOR_PATHS.SECTION_PATTERNS }
							icon={ layout }
							aria-label={ translate( 'Add sections' ) }
							onClick={ () => onMainItemSelect( { name: 'section' } ) }
						>
							{ translate( 'Sections' ) }
						</NavigationButtonAsItem>
						<NavigationButtonAsItem
							checked={ hasFooter }
							path={ NAVIGATOR_PATHS.MAIN }
							icon={ footer }
							aria-label={ translate( 'Add footer' ) }
							onClick={ () => onMainItemSelect( { name: 'footer', isPanel: true } ) }
							active={ getIsActiveButton( 'footer' ) }
						>
							{ translate( 'Footer' ) }
						</NavigationButtonAsItem>
					</NavigatorItemGroup>
					<NavigatorItemGroup title={ translate( 'Styles' ) }>
						<>
							<NavigationButtonAsItem
								checked={ hasColor }
								path={ NAVIGATOR_PATHS.COLOR_PALETTES }
								icon={ color }
								aria-label={ translate( 'Colors' ) }
								onClick={ () => onMainItemSelect( { name: 'color-palettes' } ) }
							>
								{ translate( 'Colors' ) }
							</NavigationButtonAsItem>
							<NavigationButtonAsItem
								checked={ hasFont }
								path={ NAVIGATOR_PATHS.FONT_PAIRINGS }
								icon={ typography }
								aria-label={ translate( 'Fonts' ) }
								onClick={ () => onMainItemSelect( { name: 'font-pairings' } ) }
							>
								{ translate( 'Fonts' ) }
							</NavigationButtonAsItem>
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
					label={ getLabel() }
					description={ getDescription() }
					selectedCategory={ selectedMainItem }
					categories={ categories }
					patternsMapByCategory={ patternsMapByCategory }
				/>
			) }
		</>
	);
};

export default ScreenMain;
