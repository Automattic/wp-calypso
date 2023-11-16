import { NavigatorItem, NavigatorHeader, NavigatorItemGroup } from '@automattic/onboarding';
import {
	Button,
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { color, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { NAVIGATOR_PATHS } from './constants';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';

interface Props {
	onMainItemSelect: ( name: string ) => void;
	onContinueClick: () => void;
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
	const [ disabled, setDisabled ] = useState( true );
	const { location, goTo } = useNavigator();
	const { title, description, continueLabel } = useScreen( 'styles' );

	const handleNavigatorItemSelect = ( type: string, path: string ) => {
		const nextPath = path !== location.path ? path : NAVIGATOR_PATHS.STYLES;
		goTo( nextPath, { replace: true } );
		onMainItemSelect( type );
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
				title={ <NavigatorTitle title={ title } /> }
				description={ description }
				hideBack
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
					{ continueLabel }
				</Button>
			</div>
		</>
	);
};

export default ScreenStyles;
