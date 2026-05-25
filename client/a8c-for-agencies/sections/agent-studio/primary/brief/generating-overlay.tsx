import {
	Button,
	Modal,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';

import './generating-overlay.scss';

interface Props {
	agentName: string;
	isOpen: boolean;
	onCancel: () => void;
}

const THINKING_LINES = [
	__( 'Reading the brief' ),
	__( 'Studying the brand' ),
	__( 'Considering the hierarchy' ),
	__( 'Sketching a grid' ),
	__( 'Picking type sizes' ),
	__( 'Composing the layout' ),
	__( 'Balancing the columns' ),
	__( 'Weighing the negative space' ),
	__( 'Choosing the accents' ),
	__( 'Assembling the page' ),
];

function useThinkingLine( active: boolean ): string {
	const [ index, setIndex ] = useState( 0 );

	useEffect( () => {
		if ( ! active ) {
			setIndex( 0 );
			return;
		}
		const id = setInterval( () => setIndex( ( i ) => i + 1 ), 3000 );
		return () => clearInterval( id );
	}, [ active ] );

	return THINKING_LINES[ index % THINKING_LINES.length ];
}

function useElapsedMs( active: boolean ): number {
	const [ elapsed, setElapsed ] = useState( 0 );

	useEffect( () => {
		if ( ! active ) {
			setElapsed( 0 );
			return;
		}
		const startedAt = Date.now();
		const id = setInterval( () => setElapsed( Date.now() - startedAt ), 250 );
		return () => clearInterval( id );
	}, [ active ] );

	return elapsed;
}

function formatElapsed( ms: number ): string {
	const totalSeconds = Math.floor( ms / 1000 );
	const minutes = Math.floor( totalSeconds / 60 );
	const seconds = totalSeconds % 60;
	if ( minutes === 0 ) {
		return sprintf(
			/* translators: %d is a number of seconds. */
			__( '%ds' ),
			seconds
		);
	}
	return sprintf(
		/* translators: 1: minutes, 2: seconds. */
		__( '%1$dm %2$ds' ),
		minutes,
		seconds
	);
}

export default function GeneratingOverlay( { agentName, isOpen, onCancel }: Props ) {
	const thinkingLine = useThinkingLine( isOpen );
	const elapsedMs = useElapsedMs( isOpen );

	if ( ! isOpen ) {
		return null;
	}

	return (
		<Modal
			title={ sprintf(
				/* translators: %s is an agent name. */
				__( '%s is designing' ),
				agentName
			) }
			onRequestClose={ onCancel }
			className="a4a-agent-studio-generating-overlay"
			isDismissible={ false }
			shouldCloseOnClickOutside={ false }
			shouldCloseOnEsc={ false }
			__experimentalHideHeader
		>
			<VStack spacing={ 5 } alignment="center">
				<Spinner />
				<VStack spacing={ 1 } alignment="center">
					<Text variant="muted">
						{ sprintf(
							/* translators: %s is an agent name. */
							__( '%s is designing' ),
							agentName
						) }
					</Text>
					<Text size={ 15 } weight={ 600 }>
						{ thinkingLine }
					</Text>
					<Text variant="muted">{ formatElapsed( elapsedMs ) }</Text>
				</VStack>
				<HStack justify="center">
					<Button variant="secondary" onClick={ onCancel }>
						{ __( 'Cancel' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
