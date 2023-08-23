import { Button } from '@automattic/components';
import { NavigatorButtonAsItem, NavigatorHeader, NavigatorItemGroup } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { color, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect, useState } from 'react';
import { NAVIGATOR_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import NavigatorTitle from './navigator-title';

interface Props {
	onMainItemSelect: ( name: string ) => void;
	onContinueClick: ( callback?: () => void ) => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
	selectedMainItem: string | null;
	hasColor: boolean;
	hasFont: boolean;
}

const ScreenStyles = ( {
	onMainItemSelect,
	onContinueClick,
	recordTracksEvent,
	selectedMainItem,
	hasColor,
	hasFont,
}: Props ) => {
	const translate = useTranslate();
	const [ disabled, setDisabled ] = useState( true );
	const wrapperRef = useRef< HTMLDivElement | null >( null );
	const navigator = useNavigator();
	const headerDescription = translate(
		'Create your homepage by first adding patterns and then choosing a color palette and font style.'
	);
	const getIsActiveButton = ( name: string ) => {
		return name === selectedMainItem;
	};

	const togglePanel = () => {
		if ( selectedMainItem ) {
			// Toggle panel before continue
			onMainItemSelect( selectedMainItem );
		}
	};

	const handleBackClick = () => {
		navigator.goBack();
		togglePanel();
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_STYLES_BACK_CLICK );
	};

	const handleContinueClick = () => {
		if ( ! disabled ) {
			togglePanel();
			onContinueClick();
		}
	};

	// Use the mousedown event to prevent either the button focusing or text selection
	const handleMouseDown = ( event: React.MouseEvent ) => {
		if ( disabled ) {
			event.preventDefault();
			recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.CONTINUE_MISCLICK );
		}
	};

	useEffect( () => {
		if ( selectedMainItem !== 'color-palettes' ) {
			// Open Colors initially
			setTimeout( () => onMainItemSelect( 'color-palettes' ), 250 );
		}
	}, [] );

	// Set a delay to enable the Continue button since the user might mis-click easily when they go back from another screen
	useEffect( () => {
		const timeoutId = window.setTimeout( () => setDisabled( false ), 300 );
		return () => {
			window.clearTimeout( timeoutId );
		};
	}, [] );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Pick your style' ) } /> }
				description={ headerDescription }
				onBack={ handleBackClick }
			/>
			<div className="screen-container__body" ref={ wrapperRef }>
				<VStack spacing="4">
					<NavigatorItemGroup title={ translate( 'Styles' ) }>
						<>
							<NavigatorButtonAsItem
								checked={ hasColor }
								path={ NAVIGATOR_PATHS.STYLES }
								icon={ color }
								aria-label={ translate( 'Colors' ) }
								onClick={ () => onMainItemSelect( 'color-palettes' ) }
								active={ getIsActiveButton( 'color-palettes' ) }
							>
								{ translate( 'Colors' ) }
							</NavigatorButtonAsItem>
							<NavigatorButtonAsItem
								checked={ hasFont }
								path={ NAVIGATOR_PATHS.STYLES }
								icon={ typography }
								aria-label={ translate( 'Fonts' ) }
								onClick={ () => onMainItemSelect( 'font-pairings' ) }
								active={ getIsActiveButton( 'font-pairings' ) }
							>
								{ translate( 'Fonts' ) }
							</NavigatorButtonAsItem>
						</>
					</NavigatorItemGroup>
				</VStack>
			</div>
			<div className="screen-container__footer">
				<Button
					className="pattern-assembler__button"
					primary
					aria-disabled={ disabled }
					onMouseDown={ handleMouseDown }
					onClick={ () => handleContinueClick() }
				>
					{ translate( 'Save and continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenStyles;
