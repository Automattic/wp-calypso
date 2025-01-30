import { Icon } from '@wordpress/components';
import { info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS } from 'calypso/lib/emails/email-provider-constants';
import { Mailbox } from '../../../../data/emails/types';
import './style.scss';

export function VerificatonPendingNotice( { warnings }: { warnings: Mailbox[ 'warnings' ] } ) {
	const translate = useTranslate();
	const hasWarning = warnings?.some(
		( warning ) => warning.warning_slug === EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS
	);

	if ( ! hasWarning ) {
		return null;
	}
	return (
		<div className="email-forwarm-verification-pending-notice">
			<Icon icon={ info } />
			{ translate( 'Pending verification' ) }
		</div>
	);
}
