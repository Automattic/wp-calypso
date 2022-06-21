import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCreateTitanMailboxMutation } from 'calypso/data/emails/use-create-titan-mailbox-mutation';
import { NewMailBoxList } from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/gsuite-add-users/add-users-placeholder';
import { emailManagementTitanSetUpThankYou } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import type { MailboxOperations } from 'calypso/my-sites/email/form/mailboxes/components/utilities/mailbox-operations';
import type { TitanMailboxFields } from 'calypso/my-sites/email/form/mailboxes/constants';

import './style.scss';

interface TitanSetUpMailboxFormProps {
	areSiteDomainsLoaded: boolean;
	selectedDomainName: string;
}

interface DispatchCompleteSetupClickProps {
	canContinue: boolean;
	dispatch: ( action: Record< string, unknown > ) => void;
	domainName: string;
	mailboxName: string;
}

const goToThankYouPage = ( siteSlug: string, selectedDomainName: string, mailboxName: string ) => {
	const emailAddress = `${ mailboxName }@${ selectedDomainName }`;
	page( emailManagementTitanSetUpThankYou( siteSlug, selectedDomainName, emailAddress ) );
};

const dispatchCompleteSetupClick = ( dispatchProps: DispatchCompleteSetupClickProps ) => {
	const { canContinue, dispatch, domainName, mailboxName } = dispatchProps;

	dispatch(
		recordTracksEvent(
			'calypso_email_management_titan_complete_mailbox_setup_complete_setup_button_click',
			{
				can_continue: canContinue,
				domain_name: domainName,
				mailbox_name: mailboxName,
			}
		)
	);
};

const useHandleCompleteSetup = (
	selectedDomainName: string,
	setIsValidating: ( isValidating: boolean ) => void
) => {
	const dispatch = useDispatch();
	const dispatchParameters = ( canContinue: boolean, mailbox: MailboxForm< EmailProvider > ) => {
		setIsValidating( false );

		return {
			canContinue,
			dispatch,
			domainName: mailbox.formFields.domain.value,
			mailboxName: mailbox.formFields.mailbox.value,
		};
	};

	const { isError, mutateAsync } = useCreateTitanMailboxMutation();
	const selectedSite = useSelector( getSelectedSite );
	const translate = useTranslate();

	return async ( mailboxOperations: MailboxOperations ) => {
		const mailbox = mailboxOperations.mailboxes[ 0 ];

		setIsValidating( true );

		if ( ! ( await mailboxOperations.validateAndCheck( true ) ) ) {
			dispatchCompleteSetupClick( dispatchParameters( false, mailbox ) );
			return;
		}

		try {
			await mutateAsync( mailbox.getAsFlatObject() as TitanMailboxFields );

			goToThankYouPage(
				selectedSite?.slug as string,
				selectedDomainName,
				mailbox.formFields.mailbox.value
			);
		} catch ( createError ) {
			let message = translate( 'Unknown error' );
			if ( createError != null && typeof createError === 'object' && 'message' in createError ) {
				message = ( createError as Record< string, string > ).message;
			}
			dispatch( errorNotice( message ) );
		} finally {
			dispatchCompleteSetupClick( dispatchParameters( ! isError, mailbox ) );
		}
	};
};

const TitanSetUpMailboxForm = ( {
	areSiteDomainsLoaded,
	selectedDomainName,
}: TitanSetUpMailboxFormProps ) => {
	const translate = useTranslate();
	const [ isValidating, setIsValidating ] = useState( false );
	const handleCompleteSetup = useHandleCompleteSetup( selectedDomainName, setIsValidating );

	if ( ! areSiteDomainsLoaded ) {
		return <AddEmailAddressesCardPlaceholder />;
	}

	return (
		<Card>
			<NewMailBoxList
				areButtonsBusy={ isValidating }
				onSubmit={ handleCompleteSetup }
				provider={ EmailProvider.Titan }
				selectedDomainName={ selectedDomainName }
				submitActionText={ translate( 'Complete setup' ) }
			/>
		</Card>
	);
};

export default TitanSetUpMailboxForm;
