import { Button } from '@automattic/components';
import { NavigatorButtonAsItem, NavigatorHeader, NavigatorItemGroup } from '@automattic/onboarding';
import {
	__experimentalVStack as VStack,
	__experimentalUseNavigator as useNavigator,
} from '@wordpress/components';
import { color, typography } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect } from 'react';
import { NAVIGATOR_PATHS } from './constants';
import NavigatorTitle from './navigator-title';

interface Props {
	onMainItemSelect: ( { name, isPanel }: { name: string; isPanel?: boolean } ) => void;
	onContinueClick: ( callback?: () => void ) => void;
	selectedMainItem: string | null;
	hasColor: boolean;
	hasFont: boolean;
}

const ScreenStyles = ( {
	onMainItemSelect,
	onContinueClick,
	selectedMainItem,
	hasColor,
	hasFont,
}: Props ) => {
	const translate = useTranslate();
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
			onMainItemSelect( { name: selectedMainItem, isPanel: true } );
		}
	};

	const handleContinueClick = () => {
		togglePanel();
		onContinueClick();
	};

	useEffect( () => {
		if ( selectedMainItem !== 'color-palettes' ) {
			// Open Colors initially
			setTimeout( () => onMainItemSelect( { name: 'color-palettes', isPanel: true } ), 250 );
		}
	}, [] );

	return (
		<>
			<NavigatorHeader
				title={ <NavigatorTitle title={ translate( 'Pick your style' ) } /> }
				description={ headerDescription }
				onBack={ () => {
					navigator.goBack();
					togglePanel();
				} }
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
								onClick={ () => onMainItemSelect( { name: 'color-palettes', isPanel: true } ) }
								active={ getIsActiveButton( 'color-palettes' ) }
							>
								{ translate( 'Colors' ) }
							</NavigatorButtonAsItem>
							<NavigatorButtonAsItem
								checked={ hasFont }
								path={ NAVIGATOR_PATHS.STYLES }
								icon={ typography }
								aria-label={ translate( 'Fonts' ) }
								onClick={ () => onMainItemSelect( { name: 'font-pairings', isPanel: true } ) }
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
					onClick={ () => handleContinueClick() }
				>
					{ translate( 'Save and continue' ) }
				</Button>
			</div>
		</>
	);
};

export default ScreenStyles;
