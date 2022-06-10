import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { validateAllFields } from 'calypso/lib/domains/email-forwarding';
import EmailForwardingAddNewCompact from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact';
import { composeAnalytics, withAnalytics } from 'calypso/state/analytics/actions';
import { addEmailForward } from 'calypso/state/email-forwarding/actions';
import {
	addEmailForwardSuccess,
	isAddingEmailForward,
} from 'calypso/state/selectors/get-email-forwards';
import type { FormEvent } from 'react';

type Props = {
	onConfirmEmailForwarding?: () => void;
	onAddEmailForwardSuccess: () => void;
	selectedDomainName: string;
};

const EmailForwardingAddNewCompactList = ( {
	onAddEmailForwardSuccess,
	onConfirmEmailForwarding,
	selectedDomainName,
}: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ emailForwards, setEmailForwards ] = useState( [
		{ destination: '', mailbox: '', isValid: false },
	] );
	const [ newEmailForwardAdded, setNewEmailForwardAdded ] = useState( false );

	const isSubmittingEmailForward = useSelector( ( state ) =>
		isAddingEmailForward( state, selectedDomainName )
	);
	const emailForwardSuccess = useSelector( ( state ) =>
		addEmailForwardSuccess( state, selectedDomainName )
	);

	useEffect( () => {
		if ( emailForwardSuccess && newEmailForwardAdded ) {
			setNewEmailForwardAdded( false );
			onAddEmailForwardSuccess?.();
		}
	}, [ emailForwardSuccess, newEmailForwardAdded, onAddEmailForwardSuccess ] );

	const hasValidEmailForwards = () => {
		return ! emailForwards?.some( ( forward ) => ! forward.isValid );
	};

	const addNewEmailForwardWithAnalytics = ( mailbox: string, destination: string ) => {
		withAnalytics(
			composeAnalytics(
				onConfirmEmailForwarding?.(),
				dispatch( addEmailForward( selectedDomainName, mailbox, destination ) )
			)
		);
	};

	const submitNewEmailForwards = ( event: FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		if ( isSubmittingEmailForward ) {
			return;
		}

		emailForwards?.map( ( { mailbox, destination } ) => {
			addNewEmailForwardWithAnalytics( mailbox, destination );
		} );

		setNewEmailForwardAdded( true );
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

		const validEmailForward = validateAllFields( newEmailForwards[ index ] );
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
							emailForwards={ emailForwards }
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
