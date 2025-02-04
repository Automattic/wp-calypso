import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useProtectForm } from 'calypso/lib/protect-form';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import AccountEmailField from 'calypso/me/account/account-email-field';
import ReauthRequired from 'calypso/me/reauth-required';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import getUnsavedUserSettings from 'calypso/state/selectors/get-unsaved-user-settings';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import { saveUnsavedUserSettings } from 'calypso/state/user-settings/thunks';
import type { NoticeId, NoticeOptions } from 'calypso/state/notices/types';
import type { CalypsoDispatch } from 'calypso/state/types';

const noticeId: NoticeId = 'me-security-account-email-notice';

const noticeOptions: NoticeOptions = {
	id: noticeId,
};

const SecurityAccountEmail = ( { path }: { path: string } ) => {
	const dispatch: CalypsoDispatch = useDispatch();
	const { markChanged, markSaved } = useProtectForm();
	const translate = useTranslate();

	const [ isNewEmailValid, setIsNewEmailValid ] = useState( true );
	const emailValidationHandler = ( emailIsValid: boolean ): void =>
		setIsNewEmailValid( emailIsValid );

	const emailChangeIsPending = useSelector( isPendingEmailChange );

	const unsavedUserSettings = useSelector( getUnsavedUserSettings ) ?? {};
	const userSettings = useSelector( getUserSettings ) ?? {};

	const isEmailModified = null !== ( unsavedUserSettings.user_email ?? null );

	const [ isSubmittingUpdate, setIsSubmittingUpdate ] = useState( false );

	const submitEmailUpdate = (): void => {
		dispatch( saveUnsavedUserSettings( [ 'user_email' ] ) )
			.then( () => {
				markSaved();

				const email = ( unsavedUserSettings?.user_email as string ) || '';

				dispatch(
					successNotice(
						translate(
							'We sent an email to %(email)s. Please check your inbox to verify your email.',
							{
								args: {
									email: email,
								},
							}
						),
						noticeOptions
					)
				);
			} )
			.catch( ( error ) => {
				const noticeText =
					error?.message ?? translate( 'There was a problem updating your account email.' );

				dispatch( errorNotice( noticeText, noticeOptions ) );
			} )
			.finally( () => {
				setIsSubmittingUpdate( false );
			} );
	};

	return (
		<Main wideLayout className="security-account-email">
			<PageViewTracker path={ path } title="Me > Security > Account Email " />

			<DocumentHead title={ translate( 'Account Email' ) } />

			<NavigationHeader navigationItems={ [] } title={ translate( 'Security' ) } />

			<HeaderCake backText={ translate( 'Back' ) } backHref="/me/security">
				{ translate( 'Account Email' ) }
			</HeaderCake>

			<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

			<Card className="security-account-email__content">
				<p>
					{ translate(
						'To update your account email enter a new email address below. ' +
							'You will need to confirm the new email address before the change will take effect.'
					) }
				</p>

				<AccountEmailField
					emailValidationHandler={ emailValidationHandler }
					onEmailChange={ ( emailIsModified: boolean ): void => {
						if ( emailIsModified ) {
							markChanged();
						} else {
							markSaved();
						}
					} }
					unsavedUserSettings={ unsavedUserSettings }
					userSettings={ userSettings }
				/>

				<Button
					busy={ isSubmittingUpdate }
					disabled={
						isSubmittingUpdate || emailChangeIsPending || ! isEmailModified || ! isNewEmailValid
					}
					onClick={ submitEmailUpdate }
					primary
				>
					{ translate( 'Update account email' ) }
				</Button>
			</Card>
		</Main>
	);
};

export default SecurityAccountEmail;
