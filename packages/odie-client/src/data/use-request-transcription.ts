import { useMutation } from '@tanstack/react-query';

const apiKey = 'TODO: ADD_KEY_HERE';

export const useRequestTranscription = () => {
	return useMutation( {
		mutationFn: async ( audioBlob: Blob ) => {
			const formData = new FormData();
			formData.append( 'file', audioBlob, 'hc-recording.m4a' );
			formData.append( 'response_format', 'text' );

			const response = await fetch(
				'https://public-api.wordpress.com/wpcom/v2/ai-api-proxy/v1/audio/transcriptions',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${ apiKey }`,
					},
					body: formData,
				}
			);

			if ( ! response.ok ) {
				throw new Error( 'Transcription request failed.' );
			}

			return response.text();
		},
	} );
};
