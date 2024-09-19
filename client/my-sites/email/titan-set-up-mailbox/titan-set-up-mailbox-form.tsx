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
import { usePasswordResetEmailField } from 'calypso/my-sites/email/hooks/use-password-reset-email-field';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
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
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );

	return async ( mailboxOperations: MailboxOperations ) => {
		const mailbox = mailboxOperations.mailboxes[ 0 ];

		setIsValidating( true );

		if ( ! ( await mailboxOperations.validateAndCheck( true ) ) ) {
			dispatchCompleteSetupClick( dispatchParameters( false, mailbox ) );
			return;
		}

		try {
			await mutateAsync( mailbox.getAsFlatObject() as TitanMailboxFields );

			// The provision of new user (mailbox) is done through an async process, which means
			// the new mailbox won't be immediately available. To account for this, we redirect
			// users back to the Email Management page with a 5 seconds delay, to prevent
			// users from seeing the "Set up mailbox" CTA again. There's a chance that the
			// new mailbox is still unavailable after 5 seconds, but that is an edge case that we will
			// cope with for the time being.
			await new Promise( ( resolve ) => setTimeout( resolve, 5000 ) );

			page( getEmailManagementPath( selectedSite?.slug, selectedDomainName ) );
			dispatch(
				successNotice( translate( 'Your email is now ready to use!' ), { duration: 5000 } )
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

	const defaultHiddenFields: HiddenFieldNames[] = [ FIELD_NAME ];

	const { hiddenFields, initialValue: passwordResetEmailFieldInitialValue } =
		usePasswordResetEmailField( {
			selectedDomainName,
			defaultHiddenFields,
		} );

	const [ hiddenFieldNames, setHiddenFieldNames ] = useState< HiddenFieldNames[] >( hiddenFields );

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
				initialFieldValues={ {
					[ FIELD_PASSWORD_RESET_EMAIL ]: passwordResetEmailFieldInitialValue,
				} }
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
