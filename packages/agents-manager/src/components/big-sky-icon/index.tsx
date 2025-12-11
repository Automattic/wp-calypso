/**
 * External dependencies
 */
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useCallback, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './style.scss';

interface BigSkyIconProps {
	/**
	 * Icon color variant
	 * @default 'blue'
	 */
	color?: 'blue' | 'white';
	/**
	 * Width in pixels
	 * @default 32
	 */
	width?: number;
	/**
	 * Height in pixels
	 * @default 32
	 */
	height?: number;
	/**
	 * Whether the agent is processing/thinking
	 * @default false
	 */
	isThinking?: boolean;
	/**
	 * Whether the agent is typing/responding
	 * @default false
	 */
	isTyping?: boolean;
	/**
	 * Click handler
	 */
	onClick?: ( e: React.MouseEvent | React.KeyboardEvent ) => void;
}

/**
 * BigSkyIcon Component
 *
 * Renders an animated Big Sky icon using Rive.
 * The icon has different states: inactive, thinking, and typing.
 */
export default function BigSkyIcon( {
	color = 'blue',
	width = 32,
	height = 32,
	isThinking = false,
	isTyping = false,
	onClick,
}: BigSkyIconProps ) {
	const stateMachineName = 'State Machine A';

	const iconURL = 'https://s0.wp.com/wp-content/plugins/big-sky-plugin/assets/big-sky-icon';
	const blueIcon = `${ iconURL }/blue.riv`;
	const whiteIcon = `${ iconURL }/white.riv`;

	const { rive, RiveComponent } = useRive( {
		src: color === 'blue' ? blueIcon : whiteIcon,
		stateMachines: stateMachineName,
		autoplay: false,
	} );

	const inactiveInput = useStateMachineInput( rive, stateMachineName, 'inactive', false );
	const thinkingInput = useStateMachineInput( rive, stateMachineName, 'thinking', false );
	const typingInput = useStateMachineInput( rive, stateMachineName, 'typing', false );

	const startStateMachine = useCallback( () => {
		if ( rive ) {
			rive.play( stateMachineName );
		}
	}, [ rive ] );

	// Start the state machine when ready
	useEffect( () => {
		startStateMachine();
	}, [ startStateMachine ] );

	// Update state machine inputs based on props
	useEffect( () => {
		if ( typingInput ) {
			typingInput.value = isTyping;
		}

		if ( thinkingInput ) {
			thinkingInput.value = isThinking;
		}

		if ( inactiveInput ) {
			inactiveInput.value = ! isTyping && ! isThinking;
		}
	}, [ isTyping, isThinking, typingInput, thinkingInput, inactiveInput ] );

	// Cleanup on unmount
	useEffect( () => {
		return () => {
			if ( rive ) {
				rive.cleanup();
			}
		};
	}, [ rive ] );

	const handleKeyDown = ( e: React.KeyboardEvent ) => {
		if ( onClick && ( e.key === 'Enter' || e.key === ' ' ) ) {
			e.preventDefault();
			onClick( e );
		}
	};

	return (
		<div
			className="agents-manager-big-sky-icon"
			onClick={ onClick }
			onKeyDown={ handleKeyDown }
			role="button"
			tabIndex={ 0 }
		>
			<RiveComponent style={ { width, height } } />
		</div>
	);
}
