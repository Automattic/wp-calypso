import { useCallback, useState, useRef } from '@wordpress/element';
import React from 'react';
import { MicIcon } from '../../assets/mic-icon';
import { StopRecordingIcon } from '../../assets/stop-recording-icon';
import { useRequestTranscriptions } from '../../data/use-request-transcriptions';

export const SpeechToText: React.FC< {
	shouldDisableInputField: boolean;
	onReceiveText: ( text: string ) => void;
} > = ( { shouldDisableInputField = false, onReceiveText } ) => {
	const [ isRecording, setIsRecording ] = useState< boolean >( false );
	const audioChunksRef = useRef< BlobPart[] >( [] );
	const requestTranscription = useRequestTranscriptions();
	const mediaRecorderRef = useRef< MediaRecorder | null >( null );

	const stopRecording = useCallback( () => {
		if ( mediaRecorderRef.current ) {
			mediaRecorderRef.current.stop();
		}
	}, [] );

	const recordAudio = async () => {
		try {
			setIsRecording( true );
			const stream = await navigator.mediaDevices.getUserMedia( { audio: true } );
			mediaRecorderRef.current = new MediaRecorder( stream );
			mediaRecorderRef.current.ondataavailable = ( event ) => {
				if ( event.data.size > 0 ) {
					audioChunksRef.current = [ ...audioChunksRef.current, event.data ];
				}
			};

			mediaRecorderRef.current.onstop = async () => {
				setIsRecording( false );

				// Create a Blob from the latest audio chunks
				const audioBlob = new Blob( audioChunksRef.current, { type: 'audio/m4a' } );

				try {
					const transcribedText = await requestTranscription.mutateAsync( audioBlob );
					audioChunksRef.current = [];

					if ( transcribedText ) {
						onReceiveText( transcribedText );
					}
				} catch ( error ) {}
			};

			mediaRecorderRef.current.start();
		} catch ( error ) {
			// Handle error appropriately
		}
	};

	return (
		<>
			{ ! isRecording ? (
				<button
					className="odie-send-message-inner-button odie-send-message-inner-button__flag"
					onClick={ recordAudio }
					disabled={ shouldDisableInputField }
				>
					<MicIcon />
				</button>
			) : (
				<button
					className="odie-send-message-inner-button odie-send-message-inner-button__flag"
					onClick={ stopRecording }
					disabled={ shouldDisableInputField }
				>
					<StopRecordingIcon />
				</button>
			) }
		</>
	);
};
