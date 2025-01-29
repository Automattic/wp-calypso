import { FormTokenField, TextControl, Button, Notice } from '@wordpress/components';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { isValidMailbox } from './utils';
import type { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import './styles.scss';

const MAX_FORWARD_DESTINATIONS = 5;

interface DestinationsInputProps {
	values: string[];
	onChange: ( values: string[] ) => void;
	selectedDomainName: string;
	disabled: boolean;
	existingForwardsForMailbox: number;
}

function DestinationsInput( props: DestinationsInputProps ) {
	const { values, onChange, selectedDomainName, disabled, existingForwardsForMailbox } = props;
	/** Count existing forwards before showing one more field */
	const limit = MAX_FORWARD_DESTINATIONS - existingForwardsForMailbox;
	const translate = useTranslate();

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
				__experimentalValidateInput={ ( v: string ) =>
					emailValidator.validate( v ) && ! v.endsWith( `@${ selectedDomainName }` )
				}
				placeholder={ translate(
					'These are the target email addresses where your emails will be forwarded.'
				) }
			/>
			{ values.map( ( value ) => (
				<input key={ value } type="hidden" name="destinations" value={ value } />
			) ) }
		</>
	);
}

interface SourceInputProps {
	suffix: string;
	disabled: boolean;
	onChange: ( value: string ) => void;
	value: string;
}

function SourceInput( props: SourceInputProps ) {
	const { suffix } = props;
	const translate = useTranslate();

	return (
		<div style={ { '--suffix': `"${ suffix }"` } as React.CSSProperties }>
			<TextControl
				label={ translate( 'Forward from' ) }
				className="email-forwarding__mailbox-input"
				name="mailbox"
				maxLength={ 64 }
				{ ...props }
			/>
		</div>
	);
}

interface NewForwardFormProps {
	selectedDomainName: string;
	existingEmailForwards: { mailbox: string }[];
	disabled: boolean;
}

export function NewForwardForm( {
	selectedDomainName,
	existingEmailForwards,
	disabled,
}: NewForwardFormProps ) {
	const translate = useTranslate();
	const [ mailbox, setMailbox ] = React.useState( '' );
	const [ destinations, setDestinations ] = React.useState< string[] >( [] );

	const existingForwardsForMailbox = existingEmailForwards?.filter(
		( forward ) =>
			forward.mailbox.localeCompare( mailbox, undefined, { sensitivity: 'base' } ) === 0
	).length;

	return (
		<div className="email-forwarding__form-content">
			<SourceInput
				value={ mailbox }
				onChange={ setMailbox }
				disabled={ disabled }
				suffix={ '@' + selectedDomainName }
			/>
			<DestinationsInput
				disabled={ disabled }
				selectedDomainName={ selectedDomainName }
				existingForwardsForMailbox={ existingForwardsForMailbox }
				values={ destinations }
				onChange={ setDestinations }
			/>
			<div>
				<Button
					disabled={ ! isValidMailbox( mailbox ) || destinations.length < 1 || disabled }
					variant="primary"
					type="submit"
				>
					{ translate( 'Confirm forwards' ) }
				</Button>
			</div>
		</div>
	);
}
