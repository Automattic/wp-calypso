import { Button, CheckboxControl, Notice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { DestinationsInput } from './destination-input';
import { SourceInput } from './source-input';
import { isValidMailbox } from './utils';
import type { NewForwardFormProps } from './types';
import './styles.scss';

export function NewForwardForm( {
	selectedDomainName,
	existingEmailForwards,
	disabled,
	showMxWarning,
}: NewForwardFormProps ) {
	const translate = useTranslate();
	const [ mailbox, setMailbox ] = useState( '' );
	const [ destinations, setDestinations ] = useState< string[] >( [] );
	const [ mxWarningAcknowledged, setMxWarningAcknowledged ] = useState( false );

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
			{ showMxWarning && (
				<Notice status="warning" isDismissible={ false }>
					<p>
						{ translate(
							'Enabling email forwarding will replace your current MX records. If you are using an email service like Google Workspace or Microsoft 365, this will disable that email service.'
						) }
					</p>
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ mxWarningAcknowledged }
						onChange={ setMxWarningAcknowledged }
						label={ translate(
							'I understand that adding email forwarding will replace my existing email configuration'
						) }
					/>
				</Notice>
			) }
			<div>
				<Button
					disabled={
						! isValidMailbox( mailbox ) ||
						destinations.length < 1 ||
						disabled ||
						( showMxWarning && ! mxWarningAcknowledged )
					}
					variant="primary"
					type="submit"
				>
					{ translate( 'Confirm forwards' ) }
				</Button>
			</div>
		</div>
	);
}
