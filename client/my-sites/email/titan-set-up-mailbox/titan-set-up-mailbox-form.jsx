import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCreateTitanMailboxMutation } from 'calypso/data/emails/use-create-titan-mailbox-mutation';
import { useGetTitanMailboxAvailability } from 'calypso/data/emails/use-get-titan-mailbox-availability';
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	decorateMailboxWithAvailabilityError,
	validateMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/gsuite-add-users/add-users-placeholder';
import { emailManagementTitanSetUpThankYou } from 'calypso/my-sites/email/paths';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-new-mailbox-list';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const getMailboxDomainName = ( mailbox ) => mailbox?.domain?.value;
const getMailboxUserName = ( mailbox ) => mailbox?.mailbox?.value;

const recordCompleteSetupClickEvent = ( canContinue, mailbox ) => {
	return recordTracksEvent(
		'calypso_email_management_titan_complete_mailbox_setup_complete_setup_button_click',
		{
			can_continue: canContinue,
			domain_name: getMailboxDomainName( mailbox ),
			mailbox_name: getMailboxUserName( mailbox ),
		}
	);
};

const useHandleSetupAction = (
	mailboxes,
	onMailboxesChange,
	selectedDomainName,
	setValidatedMailboxUuids
) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const mailbox = mailboxes[ 0 ];

	const selectedSite = useSelector( getSelectedSite );

	const goToThankYouPage = ( emailAddress ) => {
		page(
			emailManagementTitanSetUpThankYou(
				selectedSite?.slug ?? null,
				selectedDomainName,
				emailAddress
			)
		);
	};

	const {
		isLoading: isLoadingMailboxAvailability,
		refetch: checkMailboxAvailability,
	} = useGetTitanMailboxAvailability(
		getMailboxDomainName( mailbox ),
		getMailboxUserName( mailbox ),
		{ enabled: false } // Delays the query, and returns a callback that can be called later
	);

	const { isLoading: isCreatingMailbox, createTitanMailbox } = useCreateTitanMailboxMutation(
		getMailboxDomainName( mailbox ),
		mailbox.name?.value,
		getMailboxUserName( mailbox ),
		mailbox.password?.value,
		mailbox.alternativeEmail?.value,
		mailbox.isAdmin?.value
	);

	let isCheckingAvailability = isLoadingMailboxAvailability;

	const dispatchCompleteSetupClick = ( canContinue ) =>
		dispatch( recordCompleteSetupClickEvent( canContinue, mailbox ) );

	const handleSetup = async () => {
		const validatedMailboxes = validateMailboxes( mailboxes );
		let isMailboxValid = areAllMailboxesValid( validatedMailboxes );

		setValidatedMailboxUuids( validatedMailboxes.map( ( _mailbox ) => _mailbox.uuid ) );

		if ( ! isMailboxValid ) {
			onMailboxesChange( validatedMailboxes );

			dispatchCompleteSetupClick( isMailboxValid );

			return;
		}

		const {
			isLoading: isReloadingMailboxAvailability,
			data,
			error,
			isError,
		} = await checkMailboxAvailability();

		isCheckingAvailability = isReloadingMailboxAvailability;

		isMailboxValid = data?.message === 'OK';

		if ( isError ) {
			// Display just a subset of error messages
			const errorMessage = [ 400, 409 ].includes( error?.status ?? error?.statusCode )
				? error.message
				: translate( 'We were unable to check whether this mailbox already exists.' );

			onMailboxesChange(
				validatedMailboxes.map( ( currentMailbox ) =>
					decorateMailboxWithAvailabilityError( currentMailbox, errorMessage )
				)
			);

			dispatchCompleteSetupClick( isMailboxValid );

			return;
		}

		try {
			await createTitanMailbox();

			const emailAddress = `${ getMailboxUserName( mailbox ) }@${ getMailboxDomainName(
				mailbox
			) }`;

			goToThankYouPage( emailAddress );
		} catch ( createError ) {
			dispatch( errorNotice( createError.message ) );
		}
	};

	const isBusy = isCheckingAvailability || isCreatingMailbox;
	return { handleSetup, isBusy };
};

const TitanSetUpMailboxForm = ( { areSiteDomainsLoaded, selectedDomainName } ) => {
	const [ mailboxes, setMailboxes ] = useState( [
		buildNewTitanMailbox( selectedDomainName, false ),
	] );

	const [ validatedMailboxUuids, setValidatedMailboxUuids ] = useState( [] );

	const translate = useTranslate();

	const onMailboxesChange = useCallback( ( updatedMailboxes ) => {
		setMailboxes( updatedMailboxes );
	}, [] );

	const { handleSetup, isBusy } = useHandleSetupAction(
		mailboxes,
		onMailboxesChange,
		selectedDomainName,
		setValidatedMailboxUuids
	);

	if ( ! areSiteDomainsLoaded ) {
		return <AddEmailAddressesCardPlaceholder />;
	}

	return (
		<Card>
			<TitanNewMailboxList
				selectedDomainName={ selectedDomainName }
				mailboxes={ mailboxes }
				onMailboxesChange={ onMailboxesChange }
				showAddAnotherMailboxButton={ false }
				validatedMailboxUuids={ validatedMailboxUuids }
			>
				<Button
					className="titan-set-up-mailbox-form__button"
					primary
					busy={ isBusy }
					onClick={ handleSetup }
				>
					{ translate( 'Complete setup' ) }
				</Button>
			</TitanNewMailboxList>
		</Card>
	);
};

TitanSetUpMailboxForm.propType = {
	areSiteDomainsLoaded: PropTypes.object.isRequired,
	selectedDomainName: PropTypes.string.isRequired,
};

export default TitanSetUpMailboxForm;
