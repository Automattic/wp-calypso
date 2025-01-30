import { FormTokenField, TextControl, Button, Notice } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { isValidMailbox } from './utils';
import type { TokenItem } from '@wordpress/components/build-types/form-token-field/types';
import type { Mailbox } from 'calypso/data/emails/types';
import './styles.scss';

const MAX_FORWARD_DESTINATIONS = 5;

interface DestinationsInputProps {
	values: string[];
	onChange: ( values: string[] ) => void;
	selectedDomainName: string;
	disabled: boolean;
	existingForwardsForMailbox: Mailbox[];
	mailbox: string;
}

function DestinationsInput( props: DestinationsInputProps ) {
	const { values, onChange, selectedDomainName, disabled, existingForwardsForMailbox, mailbox } =
		props;
	/** Count existing forwards before showing one more field */
	const limit = MAX_FORWARD_DESTINATIONS - existingForwardsForMailbox.length;
	const translate = useTranslate();
	const [ offendingAddress, setOffendingAddress ] = React.useState< string | null >( null );

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
				onInputChange={ () => setOffendingAddress( null ) }
				__experimentalValidateInput={ ( v: string ) => {
					const valid = emailValidator.validate( v ) && ! v.endsWith( `@${ selectedDomainName }` );
					const duplicate = existingForwardsForMailbox.find( ( e ) => e.target === v );
					setOffendingAddress( duplicate ? v : null );
					return valid && ! duplicate;
				} }
				placeholder={ translate(
					'These are the target email addresses where your emails will be forwarded.'
				) }
			/>
			{ values.map( ( value ) => (
				<input key={ value } type="hidden" name="destinations" value={ value } />
			) ) }
			{ offendingAddress && (
				<Notice status="error" isDismissible={ false }>
					{ sprintf(
						/* translators: %s: email address %s: email address */
						translate( 'There is already a forward from (%1$s) to (%2$s).' ),
						`${ mailbox }@${ selectedDomainName }`,
						offendingAddress
					) }
				</Notice>
			) }
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
	const { onChange, suffix, ...rest } = props;
	const translate = useTranslate();
	const [ highlightSuffix, setHighlightSuffix ] = React.useState( 0 );

	return (
		<div className="email-forwarding__mailbox-input-wrapper">
			<TextControl
				label={ translate( 'Forward from' ) }
				className="email-forwarding__mailbox-input"
				name="mailbox"
				maxLength={ 64 }
				onChange={ ( value ) => onChange( value.replace( /@.*/gi, '' ) ) }
				onKeyUp={ ( event ) => {
					if ( event.key === '@' ) {
						setHighlightSuffix( ( s ) => s + 1 );
					}
				} }
				{ ...rest }
			/>
			{ /* Blink the suffix when the user enters @ */ }
			<p
				key={ highlightSuffix }
				className={ clsx( 'email-forwarding__mailbox-suffix', { animate: highlightSuffix } ) }
			>
				{ suffix }
			</p>
		</div>
	);
}

interface NewForwardFormProps {
	selectedDomainName: string;
	existingEmailForwards: Mailbox[];
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
	);

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
				mailbox={ mailbox }
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
