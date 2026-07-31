import { BigSkyIcon } from '@automattic/agenttic-ui';
import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { ImageStudioEntryPoint, store as imageStudioStore } from '../store';
import { ImageStudioMode } from '../types';
import { type ImageData } from '../utils/get-image-data';
import { trackImageStudioOpened } from '../utils/tracking';
import { handleImageSelection } from './utils';

export const addImageStudioMediaSource = (
	_value: [],
	args: {
		onSelect: ( image: any ) => void;
		multiple: boolean;
		isFeatured: boolean;
		allowedTypes: string[];
		onClick: () => void;
	}
) => {
	const { onSelect, multiple, isFeatured, onClick } = args;
	const handleClose = ( image: ImageData | null ) => {
		handleImageSelection( {
			image,
			onSelect,
			multiple,
		} );
	};

	const handleOpen = () => {
		const entryPoint = isFeatured
			? ImageStudioEntryPoint.JetpackExternalMediaFeaturedImage
			: ImageStudioEntryPoint.JetpackExternalMediaBlock;

		onClick?.();
		// Open first so the event carries the new session ID
		dispatch( imageStudioStore ).openImageStudio( undefined, handleClose, entryPoint );
		trackImageStudioOpened( {
			mode: ImageStudioMode.Edit,
			attachmentId: undefined,
			entryPoint,
		} );
	};

	return [
		{
			id: 'big-sky-image-studio',
			label: __( 'Generate Image', __i18n_text_domain__ ),
			icon: <BigSkyIcon />,
			onClick: handleOpen,
		},
	];
};
