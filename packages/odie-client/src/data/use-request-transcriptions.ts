import { useMutation } from '@tanstack/react-query';

export const useRequestTranscriptions = () => {
	return useMutation( {
		mutationFn: async ( audioBlob: Blob ) => {
			const formData = new FormData();
			formData.append( 'file', audioBlob, 'recording.m4a' );
			formData.append( 'response_format', 'text' );

			const response = await fetch(
				'https://public-api.wordpress.com/wpcom/v2/ai-api-proxy/v1/audio/transcriptions',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${ '6742f57f1848de8b47fbb72870c76ac32925e8dafbe5594a534195523787cb87' }`,
					},
					body: formData,
				}
			);

			if ( ! response.ok ) {
				throw new Error( 'Transcription request failed' );
			}

			return response.text();
		},
	} );
};
