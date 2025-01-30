import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { DestinationsInput } from './destination-input';
import { SourceInput } from './source-input';
import { isValidMailbox } from './utils';
import type { NewForwardFormProps } from './types';
import './styles.scss';

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
