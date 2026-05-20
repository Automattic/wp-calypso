import {
	Button,
	Modal,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useElapsedMs, useThinkingLines } from './use-one-pager-generation';

import './generating-overlay.scss';

interface Props {
	agentName: string;
	isOpen: boolean;
	onCancel: () => void;
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
		/* translators: 1: minutes, 2: seconds */
		__( '%1$dm %2$ds' ),
		minutes,
		seconds
	);
}

export default function GeneratingOverlay( { agentName, isOpen, onCancel }: Props ) {
	const thinkingLine = useThinkingLines( isOpen );
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
			className="a4a-one-pager-generating-overlay"
			shouldCloseOnClickOutside={ false }
			shouldCloseOnEsc={ false }
		>
			<VStack spacing={ 5 } alignment="center">
				<Spinner />
				<VStack spacing={ 2 } alignment="center">
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
