import { Button } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { focus } from '@wordpress/dom';
import { header, footer, layout, color, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef } from 'react';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { NAVIGATOR_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import { NavigationButtonAsItem } from './navigator-buttons';
import NavigatorHeader from './navigator-header';
import { NavigatorItemGroup } from './navigator-item-group';
import Survey from './survey';
import type { OnboardSelect } from '@automattic/data-stores';
import type { MouseEvent } from 'react';

interface Props {
	onSelect: ( name: string ) => void;
	onContinueClick: ( callback?: () => void ) => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
	surveyDismissed: boolean;
	setSurveyDismissed: ( dismissed: boolean ) => void;
	hasSections: boolean;
	hasHeader: boolean;
	hasFooter: boolean;
	hasColor: boolean;
	hasFont: boolean;
}

const ScreenMain = ( {
	onSelect,
	onContinueClick,
	recordTracksEvent,
	surveyDismissed,
	setSurveyDismissed,
	hasSections,
	hasHeader,
	hasFooter,
	hasColor,
	hasFont,
}: Props ) => {
	const translate = useTranslate();
	const [ disabled, setDisabled ] = useState( true );
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const { location } = useNavigator();
	const isInitialLocation = location.isInitial && ! location.isBack;
	const selectedDesign = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);

	const headerDescription = selectedDesign?.is_virtual
		? translate( 'Customize your homepage with our library of styles and patterns.' )
		: translate( 'Use our library of styles and patterns to build a homepage.' );

	// Use the mousedown event to prevent either the button focusing or text selection
	const handleMouseDown = ( event: MouseEvent< HTMLButtonElement > ) => {
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

	return (
		<>
			<NavigatorHeader
				title={ translate( 'Design your own' ) }
				description={ headerDescription }
				hideBack
			/>
			<div
				className="screen-container__body screen-container__body--align-sides"
				ref={ wrapperRef }
			>
				<HStack direction="column" alignment="top" spacing="4">
					<NavigatorItemGroup title={ translate( 'Layout' ) }>
						<NavigationButtonAsItem
							checklist
							checked={ hasHeader }
							path={ NAVIGATOR_PATHS.HEADER }
							icon={ header }
							aria-label={ translate( 'Header' ) }
							onClick={ () => onSelect( 'header' ) }
						>
							<span className="pattern-layout__list-item-text">{ translate( 'Header' ) }</span>
						</NavigationButtonAsItem>
						<NavigationButtonAsItem
							checklist
							checked={ hasSections }
							path={ hasSections ? NAVIGATOR_PATHS.SECTION : NAVIGATOR_PATHS.SECTION_PATTERNS }
							icon={ layout }
							aria-label={ translate( 'Homepage' ) }
							onClick={ () => onSelect( 'section' ) }
						>
							<span className="pattern-layout__list-item-text">{ translate( 'Homepage' ) }</span>
						</NavigationButtonAsItem>
						<NavigationButtonAsItem
							checklist
							checked={ hasFooter }
							path={ NAVIGATOR_PATHS.FOOTER }
							icon={ footer }
							aria-label={ translate( 'Footer' ) }
							onClick={ () => onSelect( 'footer' ) }
						>
							<span className="pattern-layout__list-item-text">{ translate( 'Footer' ) }</span>
						</NavigationButtonAsItem>
					</NavigatorItemGroup>
					<NavigatorItemGroup title={ translate( 'Style' ) }>
						<>
							<NavigationButtonAsItem
								checklist
								checked={ hasColor }
								path={ NAVIGATOR_PATHS.COLOR_PALETTES }
								icon={ color }
								aria-label={ translate( 'Colors' ) }
								onClick={ () => onSelect( 'color-palettes' ) }
							>
								<span className="pattern-layout__list-item-text">{ translate( 'Colors' ) }</span>
							</NavigationButtonAsItem>
							<NavigationButtonAsItem
								key="font-pairings"
								checklist
								checked={ hasFont }
								path={ NAVIGATOR_PATHS.FONT_PAIRINGS }
								icon={ typography }
								aria-label={ translate( 'Fonts' ) }
								onClick={ () => onSelect( 'font-pairings' ) }
							>
								<span className="pattern-layout__list-item-text">{ translate( 'Fonts' ) }</span>
							</NavigationButtonAsItem>
						</>
					</NavigatorItemGroup>
				</HStack>
				{ ! surveyDismissed && <Survey setSurveyDismissed={ setSurveyDismissed } /> }
			</div>
			<div className="screen-container__footer">
				<span className="screen-container__description">
					{ translate( 'Ready? Go to the Site Editor to continue editing.' ) }
				</span>
				<Button
					className="pattern-assembler__button"
					primary
					aria-disabled={ disabled }
					onMouseDown={ handleMouseDown }
					onClick={ handleClick }
				>
					{ translate( 'Continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenMain;
