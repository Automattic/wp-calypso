import { FormFileUpload, __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, closeSmall, upload } from '@wordpress/icons';
import clsx from 'clsx';
import type { LogoUpload } from '../../one-pager/engine/types';
import type { ChangeEvent } from 'react';

interface Props {
	label: string;
	logo: LogoUpload | null;
	onChange: ( logo: LogoUpload | null ) => void;
	disabled?: boolean;
	/** Renders the well with a dark background so a white-on-dark logo reads. */
	darkBackground?: boolean;
}

function readAsDataUrl( file: File ): Promise< string > {
	return new Promise( ( resolve, reject ) => {
		const reader = new FileReader();
		reader.onload = () => resolve( reader.result as string );
		reader.onerror = () => reject( reader.error );
		reader.readAsDataURL( file );
	} );
}

/**
 * Single-image upload styled as a dropzone card: empty state is a dashed
 * outline with an upload icon, filled state is the logo preview with a tiny
 * remove control. Clicking the card swaps the file. Pairs naturally side by
 * side for light / dark logo variants.
 */
export default function LogoUploadField( {
	label,
	logo,
	onChange,
	disabled,
	darkBackground,
}: Props ) {
	const previewUrl = logo?.dataUrl ?? null;
	const fileName = logo?.fileName ?? '';

	const onSelect = async ( event: ChangeEvent< HTMLInputElement > ) => {
		const file = event.target.files?.[ 0 ] ?? null;
		event.target.value = '';
		if ( ! file ) {
			return;
		}
		try {
			const dataUrl = await readAsDataUrl( file );
			onChange( { fileName: file.name, dataUrl } );
		} catch {
			// File read failures here are vanishingly rare in practice
			// (FileReader.onerror only fires on a real I/O error). Swallowing
			// keeps the form from getting stuck — user can retry.
		}
	};

	return (
		<div className="a4a-agent-studio-logo-upload">
			<FormFileUpload
				accept="image/*"
				onChange={ onSelect }
				render={ ( { openFileDialog } ) => (
					<button
						type="button"
						className={ clsx( 'a4a-agent-studio-logo-upload__well', {
							'is-filled': !! logo,
							'is-dark': darkBackground,
						} ) }
						onClick={ openFileDialog }
						disabled={ disabled }
						aria-label={
							logo
								? sprintf(
										/* translators: 1: field label, 2: file name. */
										__( 'Replace %1$s (current: %2$s)' ),
										label,
										fileName
								  )
								: sprintf(
										/* translators: %s is the field label. */
										__( 'Upload %s' ),
										label
								  )
						}
					>
						{ previewUrl && logo ? (
							<img
								className="a4a-agent-studio-logo-upload__image"
								src={ previewUrl }
								alt={ fileName }
							/>
						) : (
							<span className="a4a-agent-studio-logo-upload__prompt">
								<Icon icon={ upload } size={ 20 } />
								<Text variant="muted">{ __( 'Upload' ) }</Text>
							</span>
						) }
					</button>
				) }
			/>
			{ logo && (
				<button
					type="button"
					className="a4a-agent-studio-logo-upload__remove"
					onClick={ () => onChange( null ) }
					disabled={ disabled }
					aria-label={ sprintf(
						/* translators: %s is a logo file name. */
						__( 'Remove %s' ),
						fileName
					) }
					title={ __( 'Remove' ) }
				>
					<Icon icon={ closeSmall } size={ 16 } />
				</button>
			) }
			<Text variant="muted" className="a4a-agent-studio-logo-upload__label">
				{ label }
			</Text>
		</div>
	);
}
