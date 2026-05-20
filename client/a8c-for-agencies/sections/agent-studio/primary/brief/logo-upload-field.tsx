import { FormFileUpload, __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, closeSmall, upload } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';

interface Props {
	label: string;
	file: File | null;
	onChange: ( file: File | null ) => void;
	disabled?: boolean;
	/** Renders the well with a dark background so a white-on-dark logo reads. */
	darkBackground?: boolean;
}

/**
 * Single-image upload styled as a dropzone card: empty state is a dashed
 * outline with an upload icon, filled state is the logo preview with a tiny
 * remove control. Clicking the card swaps the file. Pairs naturally side by
 * side for light / dark logo variants.
 */
export default function LogoUploadField( {
	label,
	file,
	onChange,
	disabled,
	darkBackground,
}: Props ) {
	const objectUrlRef = useRef< { file: File; url: string } | null >( null );

	const previewUrl = ( () => {
		if ( ! file ) {
			return null;
		}
		if ( objectUrlRef.current?.file === file ) {
			return objectUrlRef.current.url;
		}
		if ( objectUrlRef.current ) {
			URL.revokeObjectURL( objectUrlRef.current.url );
		}
		objectUrlRef.current = { file, url: URL.createObjectURL( file ) };
		return objectUrlRef.current.url;
	} )();

	useEffect( () => {
		return () => {
			if ( objectUrlRef.current ) {
				URL.revokeObjectURL( objectUrlRef.current.url );
				objectUrlRef.current = null;
			}
		};
	}, [] );

	const onSelect = ( event: ChangeEvent< HTMLInputElement > ) => {
		const next = event.target.files?.[ 0 ] ?? null;
		event.target.value = '';
		if ( next ) {
			onChange( next );
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
							'is-filled': !! file,
							'is-dark': darkBackground,
						} ) }
						onClick={ openFileDialog }
						disabled={ disabled }
						aria-label={
							file
								? sprintf(
										/* translators: 1: field label, 2: file name. */
										__( 'Replace %1$s (current: %2$s)' ),
										label,
										file.name
								  )
								: sprintf(
										/* translators: %s is the field label. */
										__( 'Upload %s' ),
										label
								  )
						}
					>
						{ previewUrl && file ? (
							<img
								className="a4a-agent-studio-logo-upload__image"
								src={ previewUrl }
								alt={ file.name }
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
			{ file && (
				<button
					type="button"
					className="a4a-agent-studio-logo-upload__remove"
					onClick={ () => onChange( null ) }
					disabled={ disabled }
					aria-label={ sprintf(
						/* translators: %s is a logo file name. */
						__( 'Remove %s' ),
						file.name
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
