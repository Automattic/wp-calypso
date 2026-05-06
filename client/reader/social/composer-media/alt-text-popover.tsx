import {
	Button,
	Modal,
	TextareaControl,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';

interface Props {
	currentAlt: string;
	previewUrl: string;
	onSave: ( alt: string ) => void;
}

export function AltTextPopover( { currentAlt, previewUrl, onSave }: Props ) {
	const translate = useTranslate();
	const [ isOpen, setIsOpen ] = useState( false );
	const [ draft, setDraft ] = useState( currentAlt );

	const buttonLabel =
		currentAlt.length > 0
			? ( translate( 'Edit alt text' ) as string )
			: ( translate( 'Add alt text' ) as string );

	return (
		<>
			<Button
				size="small"
				variant="secondary"
				aria-label={ buttonLabel }
				onClick={ () => {
					setDraft( currentAlt );
					setIsOpen( true );
				} }
			>
				{ currentAlt.length > 0 ? translate( 'ALT' ) : translate( '+ ALT' ) }
			</Button>
			{ isOpen && (
				<Modal
					title={ translate( 'Alt text' ) as string }
					onRequestClose={ () => setIsOpen( false ) }
					size="medium"
				>
					<img
						src={ previewUrl }
						alt=""
						style={ { maxWidth: '100%', maxHeight: 200, marginBottom: 12 } }
					/>
					<TextareaControl
						__nextHasNoMarginBottom
						label={ translate( 'Alt text' ) }
						help={ translate( 'Describe the image for people who can’t see it.' ) }
						value={ draft }
						onChange={ setDraft }
						rows={ 4 }
					/>
					<HStack justify="flex-end" spacing={ 2 }>
						<Button variant="tertiary" onClick={ () => setIsOpen( false ) }>
							{ translate( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							onClick={ () => {
								onSave( draft );
								setIsOpen( false );
							} }
						>
							{ translate( 'Save' ) }
						</Button>
					</HStack>
				</Modal>
			) }
		</>
	);
}
