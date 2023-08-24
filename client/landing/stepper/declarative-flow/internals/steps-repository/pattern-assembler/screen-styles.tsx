import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { NavigatorItem, NavigatorHeader, NavigatorItemGroup } from '@automattic/onboarding';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { color, typography } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { NAVIGATOR_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import NavigatorTitle from './navigator-title';

interface Props {
	onMainItemSelect: ( name: string ) => void;
	onContinueClick: ( callback?: () => void ) => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
	hasColor: boolean;
	hasFont: boolean;
}

const ScreenStyles = ( {
	onMainItemSelect,
	onContinueClick,
	recordTracksEvent,
	hasColor,
	hasFont,
}: Props ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const [ disabled, setDisabled ] = useState( true );
	const { location, goTo, goBack } = useNavigator();

	const handleNavigatorItemSelect = ( type: string, path: string ) => {
		const nextPath = path !== location.path ? path : NAVIGATOR_PATHS.STYLES;
		goTo( nextPath, { replace: true } );
		onMainItemSelect( type );
	};

	const handleBackClick = () => {
		goBack();
		recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.SCREEN_BACK_CLICK, {
			screen_from: 'styles',
			screen_to: 'main',
		} );
	};

	const handleContinueClick = () => {
		if ( ! disabled ) {
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
				title={
					<NavigatorTitle
						title={
							isEnglishLocale || i18n.hasTranslation( 'Pick your style' )
								? translate( 'Pick your style' )
								: translate( 'Styles' )
						}
					/>
				}
				description={ translate(
					'Create your homepage by first adding patterns and then choosing a color palette and font style.'
				) }
				onBack={ handleBackClick }
			/>
			<div className="screen-container__body">
				<VStack spacing="4">
					<NavigatorItemGroup title={ translate( 'Styles' ) }>
						<>
							<NavigatorItem
								checked={ hasColor }
								icon={ color }
								aria-label={ translate( 'Colors' ) }
								active={ location.path === NAVIGATOR_PATHS.STYLES_COLORS }
								onClick={ () =>
									handleNavigatorItemSelect( 'color-palettes', NAVIGATOR_PATHS.STYLES_COLORS )
								}
							>
								{ translate( 'Colors' ) }
							</NavigatorItem>
							<NavigatorItem
								checked={ hasFont }
								icon={ typography }
								aria-label={ translate( 'Fonts' ) }
								active={ location.path === NAVIGATOR_PATHS.STYLES_FONTS }
								onClick={ () =>
									handleNavigatorItemSelect( 'font-pairings', NAVIGATOR_PATHS.STYLES_FONTS )
								}
							>
								{ translate( 'Fonts' ) }
							</NavigatorItem>
						</>
					</NavigatorItemGroup>
				</VStack>
			</div>
			<div className="screen-container__footer">
				<Button
					className="pattern-assembler__button"
					variant="primary"
					disabled={ disabled }
					__experimentalIsFocusable
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
