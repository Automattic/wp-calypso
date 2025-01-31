import { FormTokenField, Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { isValidDestination } from './utils';
import type { DestinationsInputProps, ValidationError } from './types';
import type { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import './styles.scss';

const MAX_FORWARD_DESTINATIONS = 5;

export function DestinationsInput( props: DestinationsInputProps ) {
	const { values, onChange, selectedDomainName, disabled, existingForwardsForMailbox, mailbox } =
		props;
	/** Consider existing forwards in the limit. */
	const limit = MAX_FORWARD_DESTINATIONS - existingForwardsForMailbox.length;
	const translate = useTranslate();
	const [ error, setError ] = React.useState< ValidationError | null >( null );

	if ( limit === 0 ) {
		return (
			<Notice status="warning" isDismissible={ false }>
				{ translate( 'This mailbox is already forwarded to the maximum number of destinations.' ) }
			</Notice>
		);
	}

	function handleChange( newValues: Array< string | TokenItem > ) {
		onChange( ( newValues as string[] ).map( ( el ) => el.toLowerCase().trim() ) );
	}

	// This mailbox is already forwarded to the maximum number of destinations.
	if ( limit === 0 ) {
		return null;
	}

	return (
		<>
			<FormTokenField
				disabled={ disabled }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ translate( 'Forward to' ) }
				onChange={ handleChange }
				value={ values.slice( 0, limit ) }
				maxLength={ limit }
				onInputChange={ () => setError( null ) }
				__experimentalValidateInput={ ( value ) => {
					const error = isValidDestination(
						value,
						selectedDomainName,
						mailbox,
						existingForwardsForMailbox,
						translate
					);
					if ( typeof error === 'object' ) {
						setError( error );
						return false;
					}
					return error;
				} }
				placeholder={ translate(
					'These are the target email addresses where your emails will be forwarded.'
				) }
			/>
			{ values.map( ( value ) => (
				<input key={ value } type="hidden" name="destinations" value={ value } />
			) ) }
			{ error && (
				<Notice status={ error.severity } isDismissible={ false }>
					{ error.message }
				</Notice>
			) }
		</>
	);
}
