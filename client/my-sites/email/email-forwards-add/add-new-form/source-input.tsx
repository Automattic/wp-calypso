import { FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import type { SourceInputProps } from './types';
import './styles.scss';

export function SourceInput( props: SourceInputProps ) {
	const { onChange, suffix, value, disabled } = props;
	const translate = useTranslate();

	return (
		<FormFieldset className="email-forwarding__mailbox-input">
			<FormLabel htmlFor="email-forwarding-mailbox">{ translate( 'Forward from' ) }</FormLabel>
			<FormTextInputWithAffixes
				id="email-forwarding-mailbox"
				name="mailbox"
				maxLength={ 64 }
				placeholder={ translate( 'e.g. contact' ) }
				value={ value }
				disabled={ disabled }
				onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
					onChange( event.target.value.replace( /@.*/gi, '' ) )
				}
				suffix={ <span className="email-forwarding__mailbox-suffix">{ suffix }</span> }
			/>
		</FormFieldset>
	);
}
