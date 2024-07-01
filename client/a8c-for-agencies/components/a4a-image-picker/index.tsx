import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import FilePicker from 'calypso/components/file-picker';

import './style.scss';

type Props = {
	className?: string;
	image?: string | null;
	onPick: ( file: File ) => void;
	error?: string | null;
};

export default function A4AImagePicker( { className, image, onPick, error }: Props ) {
	const translate = useTranslate();

	const onUpload = () => {};

	const onPickImages = ( files: FileList ) => {
		if ( files.length ) {
			onPick( files[ 0 ] );
		}
	};

	return (
		<div className={ clsx( 'a4a-image-picker', className ) }>
			<FilePicker accept="image/*" onPick={ onPickImages }>
				{ ! image && (
					<div
						className={ clsx( 'a4a-image-picker__upload-instructions', { 'is-error': !! error } ) }
					>
						{ translate( 'Click to upload an image' ) }
					</div>
				) }

				{ image && (
					<div className="a4a-image-picker__image-container">
						<img className="a4a-image-picker__image" src={ image } alt="" />
						<Button onClick={ onUpload } plain>
							{ translate( 'Upload new image' ) }
						</Button>
					</div>
				) }
			</FilePicker>

			{ error && <div className="a4a-image-picker__error">{ error }</div> }
		</div>
	);
}
