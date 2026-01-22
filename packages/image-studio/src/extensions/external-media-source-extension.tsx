import { BigSkyIcon } from '@automattic/agenttic-ui';
import { dispatch } from '@wordpress/data';
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
	const handleClose = ( image: ImageData ) => {
		handleImageSelection( {
			image,
			onSelect: args.onSelect,
			multiple: args.multiple,
		} );
	};

	const handleOpen = () => {
		const entryPoint = args.isFeatured
			? ImageStudioEntryPoint.JetpackExternalMediaFeaturedImage
			: ImageStudioEntryPoint.JetpackExternalMediaBlock;

		trackImageStudioOpened( {
			mode: ImageStudioMode.Edit,
			attachmentId: undefined,
			entryPoint,
		} );
		args.onClick();
		dispatch( imageStudioStore ).openImageStudio( undefined, handleClose, entryPoint );
	};

	return [
		{
			id: 'big-sky-image-studio',
			label: 'Generate Image',
			icon: <BigSkyIcon />,
			onClick: handleOpen,
		},
	];
};
