import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import useAddEmailForwardMutation from 'calypso/data/emails/use-add-email-forward-mutation';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import { validateAllFields } from 'calypso/lib/domains/email-forwarding';
import EmailForwardingAddNewCompact from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact';
import { isAddingEmailForward } from 'calypso/state/selectors/get-email-forwards';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { FormEvent } from 'react';

type Props = {
	onConfirmEmailForwarding?: () => void;
	onAddedEmailForward: () => void;
	selectedDomainName: string;
};

const EmailForwardingAddNewCompactList = ( {
	onAddedEmailForward,
	onConfirmEmailForwarding,
	selectedDomainName,
}: Props ) => {
	const translate = useTranslate();

	const [ emailForwards, setEmailForwards ] = useState( [
		{ destination: '', mailbox: '', isValid: false },
	] );

	const selectedSiteId = useSelector( getSelectedSiteId );

	const isSubmittingEmailForward = useSelector( ( state ) =>
		isAddingEmailForward( state, selectedDomainName )
	);

	const { data: emailAccounts = [] } = useGetEmailAccountsQuery(
		selectedSiteId,
		selectedDomainName
	);
	const existingEmailForwards = emailAccounts[ 0 ]?.emails ?? [];

	const { mutate: addEmailForward } = useAddEmailForwardMutation( selectedDomainName );

	const hasValidEmailForwards = () => {
		return ! emailForwards?.some( ( forward ) => ! forward.isValid );
	};

	const addNewEmailForwardWithAnalytics = ( mailbox: string, destination: string ) => {
		onConfirmEmailForwarding?.();
		addEmailForward( { mailbox, destination } );
		onAddedEmailForward?.();
	};

	const submitNewEmailForwards = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		if ( isSubmittingEmailForward ) {
			return;
		}

		emailForwards?.map( ( { mailbox, destination } ) => {
			addNewEmailForwardWithAnalytics( mailbox, destination );
		} );
	};

	const onAddNewEmailForward = () => {
		setEmailForwards( ( prev ) => {
			return [ ...prev, { destination: '', mailbox: '', isValid: false } ];
		} );
	};

	const onRemoveEmailForward = ( index: number ) => {
		const newEmailForwards = [ ...emailForwards ];
		newEmailForwards.splice( index, 1 );
		setEmailForwards( newEmailForwards );
	};

	const onUpdateEmailForward = (
		index: number,
		name: 'destination' | 'mailbox',
		value: string
	) => {
		const newEmailForwards = [ ...emailForwards ];
		newEmailForwards[ index ][ name ] = value;

		const validEmailForward = validateAllFields( newEmailForwards[ index ], existingEmailForwards );
		newEmailForwards[ index ].isValid =
			validEmailForward.mailbox.length === 0 && validEmailForward.destination.length === 0;

		setEmailForwards( newEmailForwards );
	};

	return (
		<form onSubmit={ submitNewEmailForwards }>
			{ emailForwards.map( ( fields, index ) => (
				<Fragment key={ `email-forwarding__add-new_fragment__card-${ index }` }>
					<div className="email-forwarding__add-new">
						<EmailForwardingAddNewCompact
							disabled={ isSubmittingEmailForward }
							emailForwards={ [
								...existingEmailForwards,
								...emailForwards.filter( ( forward, i ) => i !== index ),
							] }
							fields={ fields }
							index={ index }
							onAddEmailForward={ onAddNewEmailForward }
							onRemoveEmailForward={ onRemoveEmailForward }
							onUpdateEmailForward={ onUpdateEmailForward }
							selectedDomainName={ selectedDomainName }
						/>
					</div>
				</Fragment>
			) ) }

			<div className="email-forwarding-add-new-compact-list__actions">
				<Button
					busy={ isSubmittingEmailForward }
					disabled={ ! hasValidEmailForwards() || isSubmittingEmailForward }
					primary
					type="submit"
				>
					{ translate( 'Add' ) }
				</Button>
			</div>
		</form>
	);
};

export default EmailForwardingAddNewCompactList;
