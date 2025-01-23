import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useState } from 'react';
import useAddEmailForwardMutation from 'calypso/data/emails/use-add-email-forward-mutation';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import { validateAllFields } from 'calypso/lib/domains/email-forwarding';
import EmailForwardingAddNewCompact from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { FormEvent } from 'react';

type Props = {
	onBeforeAddEmailForwards?: () => void;
	onAddedEmailForwards: () => void;
	selectedDomainName: string;
	showFormHeader?: boolean;
};

type OnAddEmailForwardProps =
	| { index: number; name: 'mailbox'; value: string }
	| { index: number; name: 'destinations'; value: string[] };

const EmailForwardingAddNewCompactList = ( {
	onAddedEmailForwards,
	onBeforeAddEmailForwards,
	selectedDomainName,
	showFormHeader,
}: Props ) => {
	const translate = useTranslate();

	const [ emailForwards, setEmailForwards ] = useState<
		Array< { destinations: string[]; mailbox: string; isValid: boolean } >
	>( [ { destinations: [], mailbox: '', isValid: false } ] );

	const selectedSiteId = useSelector( getSelectedSiteId );

	const { data: emailAccounts = [] } = useGetEmailAccountsQuery(
		selectedSiteId,
		selectedDomainName
	);
	const existingEmailForwards = emailAccounts[ 0 ]?.emails ?? [];

	const { mutate: addEmailForward, isPending: isAddingEmailForward } =
		useAddEmailForwardMutation( selectedDomainName );

	const hasValidEmailForwards = () => {
		return ! emailForwards?.some( ( forward ) => ! forward.isValid );
	};

	const submitNewEmailForwards = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		if ( isAddingEmailForward ) {
			return;
		}

		onBeforeAddEmailForwards?.();

		emailForwards?.map( ( { mailbox, destinations } ) => {
			addEmailForward( { mailbox, destinations } );
		} );

		onAddedEmailForwards?.();
	};

	const onAddNewEmailForward = () => {
		setEmailForwards( ( prev ) => {
			return [ ...prev, { destinations: [], mailbox: '', isValid: false } ];
		} );
	};

	const onRemoveEmailForward = ( index: number ) => {
		const newEmailForwards = [ ...emailForwards ];
		newEmailForwards.splice( index, 1 );
		setEmailForwards( newEmailForwards );
	};

	const onUpdateEmailForward = ( { index, name, value }: OnAddEmailForwardProps ) => {
		const newEmailForwards = [ ...emailForwards ];
		if ( name === 'destinations' ) {
			newEmailForwards[ index ].destinations = value;
		} else {
			newEmailForwards[ index ].mailbox = value;
		}

		const validEmailForward = validateAllFields( newEmailForwards[ index ], existingEmailForwards );
		newEmailForwards[ index ].isValid =
			validEmailForward.mailbox.length === 0 && validEmailForward.destinations.length === 0;
		setEmailForwards( newEmailForwards );
	};

	return (
		<form onSubmit={ submitNewEmailForwards }>
			{ emailForwards.map( ( fields, index ) => (
				<Fragment key={ `email-forwarding__add-new_fragment__card-${ index }` }>
					<div className="email-forwarding__add-new">
						<EmailForwardingAddNewCompact
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
							showFormHeader={ showFormHeader }
						/>
					</div>
				</Fragment>
			) ) }

			<div className="email-forwarding-add-new-compact-list__actions">
				<Button disabled={ ! hasValidEmailForwards() } primary type="submit">
					{ translate( 'Add' ) }
				</Button>
			</div>
		</form>
	);
};

export default EmailForwardingAddNewCompactList;
