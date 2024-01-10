import { NavigatorHeader } from '@automattic/onboarding';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useEffect, useState } from 'react';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import { useScreen } from './hooks';
import NavigatorTitle from './navigator-title';
import PageList from './pages/page-list';

interface Props {
	pagesToShow: any[];
	onSelect: ( page: string ) => void;
	onContinueClick: () => void;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
}

const ScreenPages = ( { pagesToShow, onSelect, onContinueClick, recordTracksEvent }: Props ) => {
	const [ disabled, setDisabled ] = useState( true );
	const { title, description, continueLabel } = useScreen( 'pages' );

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
					<PageList pagesToShow={ pagesToShow } onSelectPage={ onSelect } />
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

export default ScreenPages;
