import { useCallback, useState, useRef } from '@wordpress/element';
import React from 'react';
import { MicrophoneIcon } from '../../assets/microphone-icon';
import { StopRecordingIcon } from '../../assets/stop-recording-audio-icon';
import { useRequestTranscription } from '../../data/use-request-transcription';

export const SpeechToText: React.FC< {
	shouldDisableInputField: boolean;
	onReceiveTranscribedText: ( text: string ) => void;
} > = ( { shouldDisableInputField = false, onReceiveTranscribedText } ) => {
	const [ isRecording, setIsRecording ] = useState< boolean >( false );
	const audioChunksRef = useRef< BlobPart[] >( [] );
	const requestTranscription = useRequestTranscription();
	const mediaRecorderRef = useRef< MediaRecorder | null >( null );
	const [ audioStream, setAudioStream ] = useState< MediaStream | null >( null );
	const [ microphonePermissionDenied, setMicrophonePermissionDenied ] =
		useState< boolean >( false );
	const [ isTranscribing, setIsTranscribing ] = useState< boolean >( false );

	const stopRecording = useCallback( () => {
		if ( mediaRecorderRef.current && isRecording ) {
			mediaRecorderRef.current.stop();
			setIsRecording( false );

			if ( audioStream ) {
				audioStream.getTracks().forEach( ( track ) => track.stop() );
			}
		}
	}, [ audioStream, isRecording ] );

	const startRecording = async () => {
		try {
			const userAudioStream = await navigator.mediaDevices.getUserMedia( { audio: true } );
			setAudioStream( userAudioStream );
			mediaRecorderRef.current = new MediaRecorder( userAudioStream );
			mediaRecorderRef.current.ondataavailable = ( event: BlobEvent ) => {
				audioChunksRef.current.push( event.data );
			};

			mediaRecorderRef.current.onstop = async () => {
				setIsRecording( false );
				const audioBlob = new Blob( audioChunksRef.current, { type: 'audio/wav' } );
				try {
					setIsTranscribing( true );
					const transcribedText = await requestTranscription.mutateAsync( audioBlob );
					audioChunksRef.current = [];

					if ( transcribedText ) {
						onReceiveTranscribedText( transcribedText );
					}
				} catch ( error ) {
					// console.error( 'Error sending audio to API', error );
				}
				setIsTranscribing( false );
			};

			mediaRecorderRef.current.start();
			setIsRecording( true );
			audioChunksRef.current = [];
		} catch ( error ) {
			// console.error( 'Failed to access microphone', error );
			setMicrophonePermissionDenied( true );
		}
	};

	return (
		<>
			{ ! isRecording ? (
				<button
					type="button"
					className="odie-send-message-inner-button odie-send-message-speech-to-text-button"
					onClick={ startRecording }
					disabled={ shouldDisableInputField || microphonePermissionDenied || isTranscribing }
				>
					<MicrophoneIcon />
				</button>
			) : (
				<button
					type="button"
					className="odie-send-message-inner-button odie-send-message-speech-to-text-button"
					onClick={ stopRecording }
					disabled={ shouldDisableInputField || microphonePermissionDenied || isTranscribing }
				>
					<StopRecordingIcon />
				</button>
			) }
		</>
	);
};
