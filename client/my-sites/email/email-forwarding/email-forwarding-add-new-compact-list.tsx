import useAddEmailForwardMutation from 'calypso/data/emails/use-add-email-forward-mutation';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { NewForwardForm } from '../email-forwards-add/add-new-form';
import type { FormEvent } from 'react';

type Props = {
	onAddedEmailForwards: () => void;
	selectedDomainName: string;
	showFormHeader?: boolean;
};

const EmailForwardingAddNewCompactList = ( {
	onAddedEmailForwards,
	selectedDomainName,
}: Props ) => {
	const selectedSiteId = useSelector( getSelectedSiteId );

	const { data: emailAccounts = [] } = useGetEmailAccountsQuery(
		selectedSiteId,
		selectedDomainName
	);

	const existingEmailForwards = emailAccounts[ 0 ]?.emails ?? [];

	const { mutate: addEmailForward, isPending: isAddingEmailForward } =
		useAddEmailForwardMutation( selectedDomainName );

	const submitNewEmailForwards = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		if ( isAddingEmailForward ) {
			return;
		}

		const data = new FormData( event.currentTarget );
		const mailbox = data.get( 'mailbox' ) as string;
		const destinations = data.getAll( 'destinations' );

		recordTracksEvent( 'calypso_email_management_email_forwarding_add', {
			destinations_count: destinations.length,
			mailbox: mailbox,
			domain: selectedDomainName,
		} );

		addEmailForward( { mailbox, destinations } );

		onAddedEmailForwards?.();
	};

	return (
		<form onSubmit={ submitNewEmailForwards }>
			<div className="email-forwarding__add-new">
				<NewForwardForm
					existingEmailForwards={ existingEmailForwards }
					selectedDomainName={ selectedDomainName }
					disabled={ isAddingEmailForward }
				/>
			</div>
		</form>
	);
};

export default EmailForwardingAddNewCompactList;
