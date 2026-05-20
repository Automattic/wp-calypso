import {
	Button,
	FormFileUpload,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';

interface Props {
	label: string;
	help?: string;
	file: File | null;
	onChange: ( file: File | null ) => void;
	disabled?: boolean;
	/**
	 * Renders the thumbnail well on a dark background so a white-on-dark
	 * logo reads. Use for the "dark-page logo" variant.
	 */
	darkBackground?: boolean;
	/** Label shown when no file is selected (e.g. "Upload logo"). */
	uploadLabel?: string;
}

/**
 * Single-image upload for primary / partner logos. Keeps a stable object URL
 * for the selected file so the thumbnail doesn't flicker on parent re-renders.
 */
export default function LogoUploadField( {
	label,
	help,
	file,
	onChange,
	disabled,
	darkBackground,
	uploadLabel,
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
		<VStack spacing={ 2 }>
			<Text weight={ 600 }>{ label }</Text>
			{ help && <Text variant="muted">{ help }</Text> }
			<HStack spacing={ 3 } justify="flex-start" alignment="center">
				<FormFileUpload
					accept="image/*"
					onChange={ onSelect }
					render={ ( { openFileDialog } ) => (
						<Button variant="secondary" onClick={ openFileDialog } disabled={ disabled }>
							{ file ? __( 'Replace' ) : uploadLabel ?? __( 'Upload logo' ) }
						</Button>
					) }
				/>
				{ previewUrl && file && (
					<div
						className={ clsx( 'a4a-agent-studio-logo-upload__thumb', {
							'is-dark': darkBackground,
						} ) }
					>
						<img
							className="a4a-agent-studio-logo-upload__thumb-image"
							src={ previewUrl }
							alt={ file.name }
						/>
						<Button
							className="a4a-agent-studio-logo-upload__thumb-remove"
							icon={ closeSmall }
							size="small"
							label={ sprintf(
								/* translators: %s is a logo file name. */
								__( 'Remove %s' ),
								file.name
							) }
							onClick={ () => onChange( null ) }
							disabled={ disabled }
						/>
					</div>
				) }
				{ file && <Text variant="muted">{ file.name }</Text> }
			</HStack>
		</VStack>
	);
}
