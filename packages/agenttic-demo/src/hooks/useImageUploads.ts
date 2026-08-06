import { useCallback, useState } from 'react';
import type { UploadedImage } from '@automattic/agenttic-ui';

/**
 * Simulated image uploads for demos: files become object URLs, revoked on
 * removal.
 */
export function useImageUploads() {
	const [ uploadedImages, setUploadedImages ] = useState< UploadedImage[] >(
		[]
	);

	const handleFilesSelected = useCallback( ( files: File[] ) => {
		const newImages: UploadedImage[] = files.map( ( file, index ) => ( {
			id: `${ Date.now() }-${ index }`,
			url: URL.createObjectURL( file ),
			name: file.name,
			mime_type: file.type,
		} ) );
		setUploadedImages( ( prev ) => [ ...prev, ...newImages ] );
	}, [] );

	const handleRemoveImage = useCallback( ( image: UploadedImage ) => {
		setUploadedImages( ( prev ) =>
			prev.filter( ( img ) => img.id !== image.id )
		);
		URL.revokeObjectURL( image.url );
	}, [] );

	return { uploadedImages, handleFilesSelected, handleRemoveImage };
}
