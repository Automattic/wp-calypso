import { MAX_SPACE_NAME_LENGTH } from '@automattic/api-core';
import {
	Button,
	FormTokenField,
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { DataForm, useFormValidity, type Field } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { useCreateSpace, useSpaces } from 'calypso/reader/data/spaces';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

import './style.scss';

type TranslateFn = ReturnType< typeof useTranslate >;

type CreateSpaceFormData = {
	name: string;
	tags: string[];
};

const EMPTY_FORM: CreateSpaceFormData = { name: '', tags: [] };

function validateName(
	name: string,
	existingNames: string[],
	translate: TranslateFn
): string | null {
	const trimmed = name.trim();
	if ( ! trimmed ) {
		return translate( 'Name is required' ) as string;
	}
	if ( trimmed.length > MAX_SPACE_NAME_LENGTH ) {
		return translate( 'The name must be %d characters or fewer', {
			args: [ MAX_SPACE_NAME_LENGTH ],
		} ) as string;
	}
	if ( existingNames.some( ( existing ) => existing.toLowerCase() === trimmed.toLowerCase() ) ) {
		return translate( 'A space with this name already exists' ) as string;
	}
	return null;
}

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export function CreateSpaceModal( { isOpen, onClose }: Props ) {
	// Mount the content fresh each time the modal opens so its form state resets.
	if ( ! isOpen ) {
		return null;
	}
	return <CreateSpaceModalContent onClose={ onClose } />;
}

function CreateSpaceModalContent( { onClose }: { onClose: () => void } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const spaces = useSpaces();
	const createSpace = useCreateSpace();

	const [ formData, setFormData ] = useState< CreateSpaceFormData >( EMPTY_FORM );
	const [ isNameTouched, setIsNameTouched ] = useState( false );

	const existingNames = useMemo( () => spaces.map( ( space ) => space.name ), [ spaces ] );

	const fields: Field< CreateSpaceFormData >[] = useMemo(
		() => [
			{
				id: 'name',
				label: translate( 'Name' ),
				type: 'text',
				Edit: ( { field, data, onChange, hideLabelFromVision } ) => (
					<TextControl
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ field.label }
						hideLabelFromVision={ hideLabelFromVision }
						value={ data.name }
						placeholder={ translate( 'e.g. Work, Photography, Recipes' ) }
						onChange={ ( value ) => {
							setIsNameTouched( true );
							onChange( { name: value } );
						} }
					/>
				),
				isValid: {
					custom: ( data: CreateSpaceFormData ) =>
						validateName( data.name, existingNames, translate ),
				},
			},
			{
				id: 'tags',
				label: translate( 'Tags' ),
				Edit: ( { field, data, onChange } ) => (
					<FormTokenField
						__next40pxDefaultSize
						__nextHasNoMarginBottom
						label={ field.label }
						value={ data.tags }
						placeholder={ translate( 'Add tags' ) }
						onChange={ ( tokens ) =>
							onChange( {
								tags: tokens.map( ( token ) =>
									typeof token === 'string' ? token : token.value
								),
							} )
						}
						help=""
					/>
				),
			},
		],
		[ translate, existingNames ]
	);

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'name', 'tags' ],
	};

	const { isValid } = useFormValidity( formData, fields, form );
	const nameError = validateName( formData.name, existingNames, translate );

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		if ( ! isValid || createSpace.isPending ) {
			return;
		}
		createSpace.mutate(
			{ name: formData.name.trim(), tags: formData.tags },
			{
				onSuccess: ( space ) => {
					dispatch(
						recordReaderTracksEvent( 'calypso_reader_spaces_space_created', {
							tag_count: space.tags.length,
						} )
					);
					dispatch(
						successNotice( translate( '%(name)s created.', { args: { name: space.name } } ), {
							duration: 5000,
						} )
					);
					onClose();
				},
			}
		);
	};

	return (
		<Modal title={ translate( 'Create a space' ) } size="medium" onRequestClose={ onClose }>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< CreateSpaceFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits ) => setFormData( ( data ) => ( { ...data, ...edits } ) ) }
					/>
					{ isNameTouched && nameError ? (
						<p className="create-space-modal__error" role="alert">
							{ nameError }
						</p>
					) : null }
					{ /* TODO(RSM-4139): map real backend error kinds once the endpoint exists. */ }
					{ createSpace.isError ? (
						<p className="create-space-modal__error" role="alert">
							{ translate( 'Something went wrong. Please try again.' ) }
						</p>
					) : null }
					<HStack justify="flex-end" spacing={ 2 }>
						<Button
							__next40pxDefaultSize
							variant="tertiary"
							disabled={ createSpace.isPending }
							onClick={ onClose }
						>
							{ translate( 'Cancel' ) }
						</Button>
						<Button
							__next40pxDefaultSize
							variant="primary"
							type="submit"
							isBusy={ createSpace.isPending }
							disabled={ ! isValid || createSpace.isPending }
						>
							{ translate( 'Create' ) }
						</Button>
					</HStack>
				</VStack>
			</form>
		</Modal>
	);
}
