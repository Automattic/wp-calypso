import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { focus } from '@wordpress/dom';
import { header, footer, layout, color, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useRef } from 'react';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import { NavigationButtonAsItem } from './navigator-buttons';
import NavigatorHeader from './navigator-header';
import { NavigatorItemGroup } from './navigator-item-group';
import type { MouseEvent } from 'react';

interface Props {
	shouldUnlockGlobalStyles: boolean;
	isDismissedGlobalStylesUpgradeModal?: boolean;
	hasSelectedColorVariation?: boolean;
	hasSelectedFontVariation?: boolean;
	onSelect: ( name: string ) => void;
	onContinueClick: () => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
}

const ScreenMain = ( {
	shouldUnlockGlobalStyles,
	isDismissedGlobalStylesUpgradeModal,
	hasSelectedColorVariation,
	hasSelectedFontVariation,
	onSelect,
	onContinueClick,
	recordTracksEvent,
}: Props ) => {
	const translate = useTranslate();
	const [ disabled, setDisabled ] = useState( true );
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const { location } = useNavigator();
	const isInitialLocation = location.isInitial && ! location.isBack;

	const getDescription = () => {
		if ( ! shouldUnlockGlobalStyles ) {
			return translate( 'Ready? Go to the Site Editor to continue editing.' );
		}

		if ( isDismissedGlobalStylesUpgradeModal ) {
			return translate(
				'Ready to continue? Keep your selected styles and upgrade to the Premium plan later.'
			);
		}

		if ( hasSelectedColorVariation && hasSelectedFontVariation ) {
			return translate(
				'Your font and color choices are exclusive to the Premium plan and above.'
			);
		} else if ( hasSelectedColorVariation ) {
			return translate( 'Your color choices are exclusive to the Premium plan and above.' );
		} else if ( hasSelectedFontVariation ) {
			return translate( 'Your font choices are exclusive to the Premium plan and above.' );
		}
	};

	const getContinueText = () => {
		if ( isDismissedGlobalStylesUpgradeModal ) {
			return translate( 'Continue to the editor' );
		}

		return shouldUnlockGlobalStyles && ! isDismissedGlobalStylesUpgradeModal
			? translate( 'Unlock this style' )
			: translate( 'Continue' );
	};

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
				description={ translate( 'Use our library of styles and patterns to build a homepage.' ) }
				hideBack
			/>
			<div
				className="screen-container__body screen-container__body--align-sides"
				ref={ wrapperRef }
			>
				<HStack direction="column" alignment="top" spacing="4">
					<NavigatorItemGroup title={ translate( 'Layout' ) }>
						<NavigationButtonAsItem
							path="/header"
							icon={ header }
							aria-label={ translate( 'Header' ) }
							onClick={ () => onSelect( 'header' ) }
						>
							<span className="pattern-layout__list-item-text">{ translate( 'Header' ) }</span>
						</NavigationButtonAsItem>
						<NavigationButtonAsItem
							path="/section"
							icon={ layout }
							aria-label={ translate( 'Homepage' ) }
							onClick={ () => onSelect( 'section' ) }
						>
							<span className="pattern-layout__list-item-text">{ translate( 'Homepage' ) }</span>
						</NavigationButtonAsItem>
						<NavigationButtonAsItem
							path="/footer"
							icon={ footer }
							aria-label={ translate( 'Footer' ) }
							onClick={ () => onSelect( 'footer' ) }
						>
							<span className="pattern-layout__list-item-text">{ translate( 'Footer' ) }</span>
						</NavigationButtonAsItem>
					</NavigatorItemGroup>
					{ isEnabled( 'pattern-assembler/color-and-fonts' ) && (
						<NavigatorItemGroup title={ translate( 'Style' ) }>
							<>
								<NavigationButtonAsItem
									path="/color-palettes"
									icon={ color }
									aria-label={ translate( 'Colors' ) }
									onClick={ () => onSelect( 'color-palettes' ) }
								>
									<span className="pattern-layout__list-item-text">{ translate( 'Colors' ) }</span>
								</NavigationButtonAsItem>
								<NavigationButtonAsItem
									path="/font-pairings"
									icon={ typography }
									aria-label={ translate( 'Fonts' ) }
									onClick={ () => onSelect( 'font-pairings' ) }
								>
									<span className="pattern-layout__list-item-text">{ translate( 'Fonts' ) }</span>
								</NavigationButtonAsItem>
							</>
						</NavigatorItemGroup>
					) }
				</HStack>
			</div>
			<div className="screen-container__footer">
				<span className="screen-container__description">{ getDescription() }</span>
				<Button
					className="pattern-assembler__button"
					primary
					aria-disabled={ disabled }
					onMouseDown={ handleMouseDown }
					onClick={ handleClick }
				>
					{ getContinueText() }
				</Button>
			</div>
		</>
	);
};

export default ScreenMain;
