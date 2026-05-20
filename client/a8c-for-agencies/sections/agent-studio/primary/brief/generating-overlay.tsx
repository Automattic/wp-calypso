import {
	Button,
	Modal,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import useAgentStudioRun from '../../data/use-agent-studio-run';

import './generating-overlay.scss';

interface Props {
	agentName: string;
	/** When set, the overlay polls this run id and reflects its status. */
	runId: string | null;
	/** Whether the brief form is still uploading + firing POST /a4a/runs. */
	isUploading: boolean;
	/** Fires when the polled run flips to a ready terminal status. */
	onReady: ( runId: string ) => void;
	/** Fires when the polled run flips to a failed terminal status. */
	onFailed: ( errorMessage?: string ) => void;
	/** Fires when the user clicks Cancel. */
	onCancel: () => void;
}

const STEP_COPY: Record< string, string > = {
	extract_brief: __( 'Reading the brief' ),
	compose_page_frame: __( 'Composing cover variants' ),
	layout_director_ela: __( 'Designing the layout' ),
	layout_director_ela_v2: __( 'Designing the layout' ),
	persist_as_html_post: __( 'Finalizing the deliverable' ),
};

const PRE_RUN_LINE = __( 'Sending the brief to the agent' );
const FALLBACK_LINE = __( 'Working on it' );

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

const isReadyStatus = ( status?: string ): boolean => status === 'ready';
const isFailedStatus = ( status?: string ): boolean =>
	status === 'failed' || status === 'cancelled' || status === 'error';

export default function GeneratingOverlay( {
	agentName,
	runId,
	isUploading,
	onReady,
	onFailed,
	onCancel,
}: Props ) {
	const isOpen = isUploading || !! runId;

	// While a run is in flight, poll its status every 2s so the
	// overlay's copy line reflects the real pipeline step. Stops as
	// soon as the run reaches a terminal status (handled below by the
	// onReady / onFailed effect).
	const runQuery = useAgentStudioRun( runId ?? undefined );
	useEffect( () => {
		if ( ! runId ) {
			return;
		}
		const interval = setInterval( () => {
			runQuery.refetch();
		}, 2000 );
		return () => clearInterval( interval );
		// We only want this interval to attach/detach when the run id
		// changes — `runQuery` itself is stable across refetches.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ runId ] );

	const status = runQuery.data?.status;
	const currentStep = runQuery.data?.current_step;
	const errorMessage = runQuery.data?.error?.message;

	// Fire the terminal callbacks exactly once per run id.
	const firedRef = useRef< string | null >( null );
	useEffect( () => {
		if ( ! runId || firedRef.current === runId ) {
			return;
		}
		if ( isReadyStatus( status ) ) {
			firedRef.current = runId;
			onReady( runId );
			return;
		}
		if ( isFailedStatus( status ) ) {
			firedRef.current = runId;
			onFailed( errorMessage );
		}
	}, [ runId, status, errorMessage, onReady, onFailed ] );

	const elapsedMs = useElapsedMs( isOpen );

	if ( ! isOpen ) {
		return null;
	}

	const copyLine = ( () => {
		if ( isUploading || ! runId ) {
			return PRE_RUN_LINE;
		}
		if ( currentStep && STEP_COPY[ currentStep ] ) {
			return STEP_COPY[ currentStep ];
		}
		return FALLBACK_LINE;
	} )();

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
						{ copyLine }
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
