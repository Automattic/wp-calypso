import { ChangeEvent, useRef } from 'react';
import { useAddMedia } from 'calypso/data/media/use-add-media';

type Props = {
	site: {
		ID?: number;
	};
	onLogoUpload?: ( url: string ) => void;
};

const LogoUploadButton = ( { site, onLogoUpload }: Props ) => {
	const addMedia = useAddMedia();
	const fileInputRef = useRef( null );

	if ( ! site.ID ) {
		return null;
	}

	const uploadFiles = ( event: ChangeEvent< HTMLInputElement > ) => {
		if ( event.target.files ) {
			addMedia( event.target.files, site ).then( ( media ) => {
				onLogoUpload && onLogoUpload( media[ 0 ].URL );
			} );
		}
	};

	return (
		<input
			style={ { display: 'none' } }
			ref={ fileInputRef }
			type="file"
			accept="image/jpg, image/jpeg, image/png"
			onChange={ uploadFiles }
		/>
	);
};

export default LogoUploadButton;
