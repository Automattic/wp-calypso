import { FormFileUpload, __experimentalText as Text } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, closeSmall, upload } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

interface Props {
	label: string;
	file: File | null;
	onChange: ( file: File | null ) => void;
	disabled?: boolean;
	/** Renders the well with a dark background so a white-on-dark logo reads. */
	darkBackground?: boolean;
}

export default function LogoUploadField( {
	label,
	file,
	onChange,
	disabled,
	darkBackground,
}: Props ) {
	const [ previewUrl, setPreviewUrl ] = useState< string | null >( null );

	// Create the preview URL in an effect so the matching revoke
	// always fires — `useMemo` during render leaks blobs under strict
	// mode double-renders.
	useEffect( () => {
		if ( ! file ) {
			setPreviewUrl( null );
			return;
		}
		const url = URL.createObjectURL( file );
		setPreviewUrl( url );
		return () => URL.revokeObjectURL( url );
	}, [ file ] );

	const onSelect = ( event: ChangeEvent< HTMLInputElement > ) => {
		const next = event.target.files?.[ 0 ] ?? null;
		event.target.value = '';
		if ( next ) {
			onChange( next );
		}
	};

	const fileName = file?.name ?? '';

	return (
		<div className="a4a-agent-studio-logo-upload">
			<FormFileUpload
				accept="image/png,image/jpeg"
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
										fileName
								  )
								: sprintf(
										/* translators: %s is the field label. */
										__( 'Upload %s' ),
										label
								  )
						}
					>
						{ previewUrl ? (
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
			{ file && (
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
