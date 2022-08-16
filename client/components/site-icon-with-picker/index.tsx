import { SiteDetails } from '@automattic/data-stores';
import { FormFileUpload } from '@wordpress/components';
import { Icon, upload } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import ImageEditor from 'calypso/blocks/image-editor';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import './style.scss';

export type SiteIconWithPickerProps = {
	selectedFile: File | undefined;
	onSelect: ( file: File ) => void;
	site: SiteDetails | null;
	imageEditorClassName?: string;
	uploadFieldClassName?: string;
	disabled: boolean;
};
export function SiteIconWithPicker( {
	selectedFile,
	onSelect,
	site,
	imageEditorClassName,
	uploadFieldClassName,
	disabled,
}: SiteIconWithPickerProps ) {
	const { __ } = useI18n();

	const [ selectedFileUrl, setSelectedFileUrl ] = React.useState< string | undefined >();
	const [ editingFileName, setEditingFileName ] = React.useState< string >();
	const [ editingFile, setEditingFile ] = React.useState< string >();
	const [ imageEditorOpen, setImageEditorOpen ] = React.useState< boolean >( false );
	const siteIconUrl = site?.icon?.img;

	useEffect( () => {
		if ( ! site && editingFile ) {
			onSelect( new File( [ editingFile ], editingFileName || 'site-logo.png' ) );
			setSelectedFileUrl( editingFile );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ editingFile ] );

	return (
		<>
			{ site && editingFile && imageEditorOpen && (
				<ImageEditor
					className={ classNames( 'site-icon-with-picker__image-editor', imageEditorClassName ) }
					siteId={ site.ID }
					media={ {
						src: editingFile,
					} }
					allowedAspectRatios={ [ 'ASPECT_1X1' ] }
					onDone={ ( _error: Error | null, image: Blob ) => {
						onSelect( new File( [ image ], editingFileName || 'site-logo.png' ) );
						setSelectedFileUrl( URL.createObjectURL( image ) );
						setImageEditorOpen( false );
					} }
					onCancel={ () => {
						setEditingFile( undefined );
						setEditingFileName( undefined );
						setImageEditorOpen( false );
					} }
				/>
			) }
			<FormFieldset
				className={ classNames( 'site-icon-with-picker__site-icon', uploadFieldClassName ) }
				disabled={ disabled }
			>
				<FormFileUpload
					className={ classNames( 'site-icon-with-picker__upload-button', {
						'has-icon-or-image': selectedFile || siteIconUrl,
					} ) }
					accept=".jpg,.jpeg,.gif,.png"
					onChange={ ( event ) => {
						if ( event.target.files?.[ 0 ] ) {
							setEditingFileName( event.target.files?.[ 0 ].name );
							setEditingFile( URL.createObjectURL( event.target.files?.[ 0 ] ) );
							setImageEditorOpen( true );
							// onChange won't fire if the user picks the same file again
							// delete the value so users can reselect the same file again
							event.target.value = '';
						}
					} }
				>
					{ selectedFileUrl || siteIconUrl ? (
						<img src={ selectedFileUrl || siteIconUrl } alt={ site?.name } />
					) : (
						<Icon icon={ upload } />
					) }
					<span>
						{ selectedFileUrl || siteIconUrl ? __( 'Replace' ) : __( 'Upload publication icon' ) }
					</span>
				</FormFileUpload>
			</FormFieldset>
		</>
	);
}
