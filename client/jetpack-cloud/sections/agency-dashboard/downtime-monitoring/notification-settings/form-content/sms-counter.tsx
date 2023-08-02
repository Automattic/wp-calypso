import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

export default function SMSCounter() {
	const translate = useTranslate();

	// TODO: Replace with real data
	const monthlyUsedCount = 5;
	const montlyLimit = 20;

	const limitReached = monthlyUsedCount >= montlyLimit;

	return (
		<div
			className={ classNames( 'notification-settings__sms-counter', {
				'notification-settings__sms-counter-limit-reached': limitReached,
			} ) }
		>
			{ translate( '%(monthlyUsedCount)d/%(montlyLimit)d SMS used this month on this site', {
				args: { monthlyUsedCount, montlyLimit },
				comment:
					'monthlyUsedCount is the number of SMS used in a month, montlyLimit is the maximum number of SMS allowed in a month',
			} ) }
		</div>
	);
}
