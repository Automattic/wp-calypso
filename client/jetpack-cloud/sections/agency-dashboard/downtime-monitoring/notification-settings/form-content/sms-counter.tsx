import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { MonitorSettings } from '../../../sites-overview/types';

interface Props {
	settings: MonitorSettings;
}

export default function SMSCounter( { settings }: Props ) {
	const translate = useTranslate();

	const monthlyLimit = settings.sms_monthly_limit || 0;
	const monthlyUsedCount = settings.sms_sent_count || 0;

	if ( ! monthlyLimit ) {
		return null;
	}

	return (
		<div
			className={ clsx( 'notification-settings__sms-counter', {
				'notification-settings__sms-counter-limit-reached': settings.is_over_limit,
			} ) }
		>
			{ translate( '%(monthlyUsedCount)d/%(monthlyLimit)d SMS used this month on this site', {
				args: { monthlyUsedCount, monthlyLimit },
				comment:
					'monthlyUsedCount is the number of SMS used in a month, monthlyLimit is the maximum number of SMS allowed in a month',
			} ) }
		</div>
	);
}
