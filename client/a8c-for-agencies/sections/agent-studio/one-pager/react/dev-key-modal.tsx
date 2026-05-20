import {
	Button,
	Modal,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import {
	getLocalDevKey,
	getLocalDevModel,
	isDevEnvironment,
	setLocalDevKey,
	setLocalDevModel,
} from '../services/env';

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export function DevKeyTrigger( { onOpen }: { onOpen: () => void } ) {
	if ( ! isDevEnvironment() ) {
		return null;
	}
	return (
		<Button variant="link" onClick={ onOpen }>
			{ __( 'Set local key' ) }
		</Button>
	);
}

export default function DevKeyModal( { isOpen, onClose }: Props ) {
	const [ key, setKey ] = useState( getLocalDevKey() ?? '' );
	const [ model, setModel ] = useState( getLocalDevModel() ?? '' );

	if ( ! isOpen ) {
		return null;
	}

	const onSave = () => {
		setLocalDevKey( key.trim() || undefined );
		setLocalDevModel( model.trim() || undefined );
		onClose();
	};

	const onClear = () => {
		setKey( '' );
		setModel( '' );
		setLocalDevKey( undefined );
		setLocalDevModel( undefined );
		onClose();
	};

	return (
		<Modal title={ __( 'Local LLM key' ) } onRequestClose={ onClose }>
			<VStack spacing={ 4 }>
				<Text variant="muted">
					{ __(
						'Used only on your machine. The key is stored in localStorage and never sent anywhere except OpenAI. Build-time env vars (A4A_OPENAI_API_KEY) work too.'
					) }
				</Text>
				<TextControl
					label={ __( 'OpenAI API key' ) }
					value={ key }
					onChange={ setKey }
					type="password"
					placeholder="sk-..."
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<TextControl
					label={ __( 'Model (optional)' ) }
					value={ model }
					onChange={ setModel }
					placeholder="gpt-4o-mini"
					help={ __( 'Falls back to gpt-4o-mini.' ) }
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
				<HStack justify="flex-end" spacing={ 2 }>
					<Button variant="tertiary" onClick={ onClear }>
						{ __( 'Clear' ) }
					</Button>
					<Button variant="primary" onClick={ onSave }>
						{ __( 'Save' ) }
					</Button>
				</HStack>
			</VStack>
		</Modal>
	);
}
