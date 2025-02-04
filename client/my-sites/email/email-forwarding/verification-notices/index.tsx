import { Icon } from '@wordpress/components';
import { check, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS } from 'calypso/lib/emails/email-provider-constants';
import { Mailbox } from '../../../../data/emails/types';
import './style.scss';

export function VerificationPendingNotice( { mailbox }: { mailbox: Mailbox } ) {
	const translate = useTranslate();
	const hasWarning = mailbox.warnings?.some(
		( warning ) => warning.warning_slug === EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS
	);

	if ( ! hasWarning && ! mailbox.temporary ) {
		return (
			<div className="email-forward-verification-status active">
				<Icon icon={ check } />
				<span>{ translate( 'Active' ) }</span>
			</div>
		);
	}
	return (
		<div className="email-forward-verification-status verification-pending">
			<Icon icon={ info } />
			{ translate( 'Pending verification' ) }
		</div>
	);
}
