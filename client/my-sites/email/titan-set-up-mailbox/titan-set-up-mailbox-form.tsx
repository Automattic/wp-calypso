import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { MouseEvent, useState } from 'react';
import { useCreateTitanMailboxMutation } from 'calypso/data/emails/use-create-titan-mailbox-mutation';
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/add-mailboxes/add-users-placeholder';
import {
	HiddenFieldNames,
	NewMailBoxList,
} from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import PasswordResetTipField from 'calypso/my-sites/email/form/mailboxes/components/password-reset-tip-field';
import {
	FIELD_NAME,
	FIELD_PASSWORD_RESET_EMAIL,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { emailManagementTitanSetUpThankYou } from 'calypso/my-sites/email/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
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
	const userEmail = useSelector( getCurrentUserEmail );
	const [ isValidating, setIsValidating ] = useState( false );
	const handleCompleteSetup = useHandleCompleteSetup( selectedDomainName, setIsValidating );
	const [ hiddenFieldNames, setHiddenFieldNames ] = useState< HiddenFieldNames[] >( [
		FIELD_NAME,
		FIELD_PASSWORD_RESET_EMAIL,
	] );

	if ( ! areSiteDomainsLoaded ) {
		return <AddEmailAddressesCardPlaceholder />;
	}

	const showPasswordResetEmailField = ( event: MouseEvent< HTMLElement > ) => {
		event.preventDefault();
		setHiddenFieldNames( [ FIELD_NAME ] );
	};

	return (
		<Card>
			<NewMailBoxList
				areButtonsBusy={ isValidating }
				hiddenFieldNames={ hiddenFieldNames }
				initialFieldValues={ { [ FIELD_PASSWORD_RESET_EMAIL ]: userEmail } }
				isAutoFocusEnabled
				onSubmit={ handleCompleteSetup }
				provider={ EmailProvider.Titan }
				selectedDomainName={ selectedDomainName }
				submitActionText={ translate( 'Complete setup' ) }
			>
				{ hiddenFieldNames.includes( FIELD_PASSWORD_RESET_EMAIL ) && (
					<PasswordResetTipField tipClickHandler={ showPasswordResetEmailField } />
				) }
			</NewMailBoxList>
		</Card>
	);
};

export default TitanSetUpMailboxForm;
