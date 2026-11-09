import { ACCOUNT_EMAIL_RECOVERY_SNOOZE } from '@automattic/api-core';
import { isSupportSession } from '@automattic/calypso-support-session';
import { FormInputValidation } from '@automattic/components';
import {
	getAccountEmailRecoverySnoozeUntil,
	isAccountEmailAtRisk,
	isAccountEmailRecoverySnoozed,
} from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import type { UserPreferences } from '@automattic/api-core';

interface Props {
	savedEmail: string;
	show: boolean;
	isDraft: boolean;
	isPending: boolean;
	recoveryIsReady: boolean;
	openInNewTab: boolean;
}

export default function AccountEmailRecoveryNotice( {
	savedEmail,
	show,
	isDraft,
	isPending,
	recoveryIsReady,
	openInNewTab,
}: Props ) {
	const translate = useTranslate();
	const [ snoozeUntil, setSnoozeUntil ] = useState< number >();
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveFailed, setSaveFailed ] = useState( false );
	const savedEmailIsAtRisk = isAccountEmailAtRisk( savedEmail );

	useEffect( () => {
		if ( ! savedEmailIsAtRisk ) {
			return;
		}

		let active = true;
		wpcom.req
			.get( '/me/preferences' )
			.then( ( { calypso_preferences }: { calypso_preferences?: UserPreferences } ) => {
				if ( active ) {
					setSnoozeUntil( calypso_preferences?.[ ACCOUNT_EMAIL_RECOVERY_SNOOZE ] ?? 0 );
				}
			} )
			.catch( () => {
				if ( active ) {
					setSnoozeUntil( 0 );
				}
			} );

		return () => {
			active = false;
		};
	}, [ savedEmailIsAtRisk ] );

	if (
		! show ||
		( ! isDraft && ( snoozeUntil === undefined || isAccountEmailRecoverySnoozed( snoozeUntil ) ) )
	) {
		return null;
	}

	async function dismiss() {
		setIsSaving( true );
		setSaveFailed( false );
		const until = getAccountEmailRecoverySnoozeUntil();
		try {
			const { calypso_preferences } = await wpcom.req.post( '/me/preferences', {
				calypso_preferences: { [ ACCOUNT_EMAIL_RECOVERY_SNOOZE ]: until },
			} );
			if ( calypso_preferences?.[ ACCOUNT_EMAIL_RECOVERY_SNOOZE ] !== until ) {
				setSaveFailed( true );
				return;
			}
			setSnoozeUntil( until );
		} catch {
			setSaveFailed( true );
		} finally {
			setIsSaving( false );
		}
	}

	let message = translate(
		'If you don’t have a verified recovery email or phone number, set one up in case you lose access to this email address.',
		{ textOnly: true }
	);
	if ( isPending ) {
		message = translate(
			'Until you confirm the change, %(email)s is still your sign-in email. Add or verify a recovery email or phone number in case you lose access to it.',
			{ args: { email: savedEmail }, textOnly: true }
		);
	} else if ( recoveryIsReady ) {
		message = translate(
			'If you lose access to this email address, it may be harder to get back into your account. Add or verify a recovery email or phone number.',
			{ textOnly: true }
		);
	}

	return (
		<>
			<FormInputValidation isError={ false } isWarning text={ message }>
				{ ' ' }
				<a
					href="/me/security/account-recovery"
					target={ openInNewTab ? '_blank' : undefined }
					rel={ openInNewTab ? 'noopener' : undefined }
					aria-label={
						openInNewTab ? translate( 'Set up account recovery (opens in a new tab)' ) : undefined
					}
				>
					{ translate( 'Set up account recovery' ) }
				</a>
			</FormInputValidation>
			{ ! isDraft && ! isPending && ! isSupportSession() && (
				<>
					<Button
						type="button"
						variant="link"
						onClick={ dismiss }
						disabled={ isSaving }
						isBusy={ isSaving }
					>
						{ translate( 'Remind me in six months' ) }
					</Button>
					{ saveFailed && (
						<FormInputValidation
							isError
							text={ translate( 'Could not dismiss this reminder. Please try again.' ) }
						/>
					) }
				</>
			) }
		</>
	);
}
