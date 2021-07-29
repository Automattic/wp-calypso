/**
 * External dependencies
 */
import { Button, Card } from '@automattic/components';
import page from 'page';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/gsuite-add-users/add-users-placeholder';
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	decorateMailboxWithAvailabilityError,
	validateMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
const getMailboxDomainName = ( mailbox ) => mailbox?.domain?.value;
const getMailboxUserName = ( mailbox ) => mailbox?.mailbox?.value;
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-add-mailboxes/titan-new-mailbox-list';
import { useCreateTitanMailboxMutation } from 'calypso/data/emails/use-create-titan-mailbox-mutation';
import { useGetTitanMailboxAvailability } from 'calypso/data/emails/use-get-titan-mailbox-availability';

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

const useHandleSetupAction = ( mailboxes, onMailboxesChange, selectedDomainName ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const mailbox = mailboxes[ 0 ];

	const selectedSite = useSelector( getSelectedSite );
	const currentRoute = useSelector( getCurrentRoute );

	const goToThankYouPage = () => {
		// TODO: Change the destination to the Thank You page once it's ready
		page( emailManagement( selectedSite?.slug ?? null, selectedDomainName, currentRoute ) );
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

		if ( ! isMailboxValid ) {
			mailboxes = mailboxes.map( ( currentMailbox ) =>
				decorateMailboxWithAvailabilityError( currentMailbox, 'Freaks' )
			);
			onMailboxesChange( mailboxes );

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

			mailboxes = mailboxes.map( ( currentMailbox ) =>
				decorateMailboxWithAvailabilityError( currentMailbox, errorMessage )
			);

			onMailboxesChange( mailboxes );

			dispatchCompleteSetupClick( isMailboxValid );

			return;
		}

		try {
			await createTitanMailbox();

			goToThankYouPage();
		} catch ( createError ) {
			dispatch( errorNotice( createError.message ) );
		}
	};

	const isBusy = isCheckingAvailability || isCreatingMailbox;
	return { handleSetup, isBusy };
};

const TitanSetupMailboxForm = ( { selectedDomainName, siteDomainsAreLoaded } ) => {
	const [ mailboxes, setMailboxes ] = useState( [
		buildNewTitanMailbox( selectedDomainName, false ),
	] );

	const translate = useTranslate();

	const onMailboxesChange = useCallback( ( updatedMailboxes ) => {
		setMailboxes( updatedMailboxes );
	}, [] );

	const { handleSetup, isBusy } = useHandleSetupAction(
		mailboxes,
		onMailboxesChange,
		selectedDomainName
	);

	if ( ! siteDomainsAreLoaded ) {
		return <AddEmailAddressesCardPlaceholder />;
	}

	return (
		<Card>
			<TitanNewMailboxList
				domain={ selectedDomainName }
				mailboxes={ mailboxes }
				onMailboxesChange={ onMailboxesChange }
				showAddAnotherMailboxButton={ false }
				validatedMailboxUuids={ mailboxes.map( ( mailbox ) => mailbox.uid ) }
			>
				<Button
					className="titan-setup-mailbox__action-continue"
					primary
					busy={ isBusy }
					onClick={ handleSetup }
				>
					{ translate( 'Set Up' ) }
				</Button>
			</TitanNewMailboxList>
		</Card>
	);
};

TitanSetupMailboxForm.propType = {
	selectedDomainName: PropTypes.string.isRequired,
	siteDomainsAreLoaded: PropTypes.object.isRequired,
};

export default TitanSetupMailboxForm;
