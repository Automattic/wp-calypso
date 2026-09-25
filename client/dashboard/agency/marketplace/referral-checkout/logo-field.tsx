import {
	Button,
	DropZone,
	FormFileUpload,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, upload } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Text } from '../../../components/text';
import { LOGO_ACCEPT, validateLogoFile } from '../../lib/logo-file';
import { getReferralLogoOption } from './lib/logo';
import type { ReferralLogo } from './lib/logo';

interface Props {
	value: ReferralLogo;
	onChange: ( logo: ReferralLogo ) => void;
	profileLogoUrl: string | null;
	lastReferralLogoUrl: string | null;
}

/**
 * One field for the logo the referral email carries: a drop area with nothing
 * chosen, or the chosen logo in a frame with the other choices beside it.
 */
export default function ReferralLogoField( {
	value,
	onChange,
	profileLogoUrl,
	lastReferralLogoUrl,
}: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const [ error, setError ] = useState< string | null >( null );

	// The preview of a picked file is an object URL, released when it goes away.
	useEffect( () => {
		if ( value.type !== 'file' ) {
			return;
		}
		const { previewUrl } = value;
		return () => URL.revokeObjectURL( previewUrl );
	}, [ value ] );

	const choose = ( logo: ReferralLogo ) => {
		recordTracksEvent( 'calypso_a4a_client_referral_logo_option_click', {
			option: getReferralLogoOption( logo ),
		} );
		setError( null );
		onChange( logo );
	};

	const pickFile = async ( file?: File ) => {
		if ( ! file ) {
			return;
		}
		const validationError = await validateLogoFile( file );
		setError( validationError );
		if ( validationError ) {
			return;
		}
		recordTracksEvent( 'calypso_a4a_client_referral_logo_file_select' );
		onChange( { type: 'file', file, previewUrl: URL.createObjectURL( file ) } );
	};

	// The upload component wraps its render in a block, so it goes around the
	// whole sentence and the link stays inline with the text.
	const withFilePicker = ( render: ( openFileDialog: () => void ) => React.ReactNode ) => (
		<FormFileUpload
			accept={ LOGO_ACCEPT }
			onChange={ ( event ) => {
				pickFile( event.currentTarget.files?.[ 0 ] );
				// Allow picking the same file again after a failed check.
				event.currentTarget.value = '';
			} }
			render={ ( { openFileDialog } ) => render( openFileDialog ) }
		/>
	);

	const otherChoices = (
		<>
			{ value.type !== 'profile' && profileLogoUrl && (
				<Button variant="link" onClick={ () => choose( { type: 'profile', url: profileLogoUrl } ) }>
					{ __( 'Use profile logo' ) }
				</Button>
			) }
			{ value.type !== 'last' && lastReferralLogoUrl && (
				<Button
					variant="link"
					onClick={ () => choose( { type: 'last', url: lastReferralLogoUrl } ) }
				>
					{ __( 'Use last referral logo' ) }
				</Button>
			) }
		</>
	);

	const getLabel = () => {
		switch ( value.type ) {
			case 'profile':
				return __( 'Profile logo' );
			case 'last':
				return __( 'Last referral logo' );
			case 'file':
				return value.file.name;
			default:
				return '';
		}
	};

	return (
		<VStack spacing={ 2 } className="referral-checkout__logo-field">
			<Text as="label" weight={ 600 } size={ 11 } upperCase>
				{ __( 'Your logo (optional)' ) }
			</Text>
			{ value.type === 'none' ? (
				<>
					<div className="referral-checkout__logo-drop-area">
						<DropZone
							label={ __( 'Drop to upload' ) }
							onFilesDrop={ ( files ) => pickFile( files[ 0 ] ) }
						/>
						<VStack spacing={ 1 } alignment="center">
							<Icon icon={ upload } />
							{ withFilePicker( ( openFileDialog ) => (
								<Text>
									{ createInterpolateElement(
										__( 'Drop your logo here or <select>select a file</select>' ),
										{
											select: (
												<Button variant="link" onClick={ openFileDialog }>
													{ __( 'select a file' ) }
												</Button>
											),
										}
									) }
								</Text>
							) ) }
							<Text variant="muted" size={ 12 }>
								{ __( 'Upload your logo sized at 800px by 320px. JPG or PNG. Max 10 MB.' ) }
							</Text>
						</VStack>
					</div>
					<HStack spacing={ 4 } justify="flex-start" expanded={ false }>
						{ otherChoices }
					</HStack>
				</>
			) : (
				<HStack spacing={ 6 } alignment="center" justify="flex-start" expanded={ false }>
					<div className="referral-checkout__logo-frame">
						<img
							src={ value.type === 'file' ? value.previewUrl : value.url }
							alt={ __( 'Referral logo' ) }
						/>
					</div>
					<VStack spacing={ 2 } alignment="flex-start">
						<Text variant="muted">{ getLabel() }</Text>
						{ withFilePicker( ( openFileDialog ) => (
							<Button variant="link" onClick={ openFileDialog }>
								{ __( 'Use a different logo' ) }
							</Button>
						) ) }
						<Button variant="link" onClick={ () => choose( { type: 'none' } ) }>
							{ __( 'Send without logo' ) }
						</Button>
						{ otherChoices }
					</VStack>
				</HStack>
			) }
			{ error && <Text intent="error">{ error }</Text> }
			<Text variant="muted" size={ 12 }>
				{ __( 'Add a logo to build trust and show this referral comes from you.' ) }
			</Text>
		</VStack>
	);
}
