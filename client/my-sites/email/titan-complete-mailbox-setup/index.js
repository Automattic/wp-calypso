/**
 * External dependencies
 */
import { Button, Card } from '@automattic/components';
import page from 'page';
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
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
import DocumentHead from 'calypso/components/data/document-head';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	emailManagement,
	emailManagementCompleteTitanMailboxSetup,
} from 'calypso/my-sites/email/paths';
import { errorNotice } from 'calypso/state/notices/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-add-mailboxes/titan-new-mailbox-list';
import { useCreateTitanMailboxMutation } from 'calypso/data/emails/use-create-titan-mailbox-mutation';
import { useGetTitanMailboxAvailability } from 'calypso/data/emails/use-get-titan-mailbox-availability';

const getMailboxUserName = ( mailbox ) => mailbox?.mailbox?.value;
const getMailboxDomainName = ( mailbox ) => mailbox?.domain?.value;

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

	const handleCompleteSetup = async () => {
		const validatedMailboxes = validateMailboxes( mailboxes );
		let mailboxIsValid = areAllMailboxesValid( validatedMailboxes );

		if ( mailboxIsValid ) {
			const {
				isLoading: isReloadingMailboxAvailability,
				data,
				error,
				isError,
			} = await checkMailboxAvailability();

			isCheckingAvailability = isReloadingMailboxAvailability;

			mailboxIsValid = data?.message === 'OK';

			if ( isError ) {
				// Display just a subset of error messages
				const errorMessage = [ 400, 409 ].includes( error?.status ?? error?.statusCode )
					? error.message
					: translate( 'We were unable to check whether this mailbox already exists.' );

				mailboxes = mailboxes.map( ( currentMailbox ) =>
					decorateMailboxWithAvailabilityError( currentMailbox, errorMessage )
				);

				onMailboxesChange( mailboxes );

				dispatchCompleteSetupClick( mailboxIsValid );

				return;
			}
		}

		dispatchCompleteSetupClick( mailboxIsValid );

		if ( ! mailboxIsValid ) {
			return;
		}

		try {
			await createTitanMailbox();

			goToThankYouPage();
		} catch ( error ) {
			dispatch( errorNotice( error.message ) );
		}
	};

	const isBusy = isCheckingAvailability || isCreatingMailbox;
	return { handleCompleteSetup, isBusy };
};

const SetupForm = ( { selectedDomainName, siteDomainsAreLoaded } ) => {
	const [ mailboxes, setMailboxes ] = useState( [
		buildNewTitanMailbox( selectedDomainName, false ),
	] );

	const translate = useTranslate();

	const onMailboxesChange = useCallback( ( updatedMailboxes ) => {
		setMailboxes( updatedMailboxes );
	}, [] );

	const { handleCompleteSetup, isBusy } = useHandleSetupAction(
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
					className="titan-complete-mailbox-setup__action-continue"
					primary
					busy={ isBusy }
					onClick={ handleCompleteSetup }
				>
					{ translate( 'Set Up' ) }
				</Button>
			</TitanNewMailboxList>
		</Card>
	);
};

SetupForm.propType = {
	selectedDomainName: PropTypes.string.isRequired,
	siteDomainsAreLoaded: PropTypes.object.isRequired,
};

const TitanCompleteMailboxSetup = ( { selectedDomainName } ) => {
	const selectedSite = useSelector( getSelectedSite );

	const currentRoute = useSelector( getCurrentRoute );

	const siteId = selectedSite?.ID ?? null;

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, siteId ) );

	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );

	const hasTitanSubscription = hasTitanMailWithUs( selectedDomain );

	const siteDomainsAreLoaded = useSelector( ( state ) => hasLoadedSiteDomains( state, siteId ) );

	const analyticsPath = emailManagementCompleteTitanMailboxSetup(
		':site',
		':domain',
		currentRoute
	);

	const siteSlug = selectedSite?.slug ?? null;

	const goToEmailPlan = useCallback( () => {
		page( emailManagement( siteSlug, selectedDomainName, currentRoute ) );
	}, [ currentRoute, selectedDomainName, siteSlug ] );

	const translate = useTranslate();

	if ( siteDomainsAreLoaded && ! hasTitanSubscription ) {
		goToEmailPlan();

		return null;
	}

	return (
		<>
			<PageViewTracker
				path={ analyticsPath }
				title="Email Management > Set up your Professional Email mailbox"
			/>

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<Main wideLayout={ true }>
				<DocumentHead title={ translate( 'Set up your Professional Email' ) } />

				<EmailHeader currentRoute={ currentRoute } selectedSite={ selectedSite } />

				<HeaderCake onClick={ goToEmailPlan }>
					{ translate( 'Set up your Professional Email' ) }
				</HeaderCake>

				<SetupForm
					siteDomainsAreLoaded={ siteDomainsAreLoaded }
					selectedDomainName={ selectedDomainName }
				/>
			</Main>
		</>
	);
};

TitanCompleteMailboxSetup.propType = {
	selectedDomainName: PropTypes.string.isRequired,
};

export default TitanCompleteMailboxSetup;
