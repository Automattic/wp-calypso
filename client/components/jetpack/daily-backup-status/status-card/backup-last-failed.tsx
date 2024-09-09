import { Gridicon } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import type { Moment } from 'moment';

type Props = {
	baseBackupDate: Moment;
	eventsCount: number;
	selectedBackupDate: Moment;
	learnMoreUrl?: string;
};

export const BackupLastFailed: FunctionComponent< Props > = () => {
	const translate = useTranslate();
	const learnMoreLink = 'https://jetpack.com/support/backup/troubleshooting-jetpack-backup/';

	return (
		<div className="backup-last-failed__wrapper">
			<span className="backup-last-failed__info">
				<Gridicon icon="notice-outline" />
				{ translate(
					"We encountered some issues with today's backup, but don't worry! " +
						"We're using the most recent backup available. " +
						'{{ExternalLink}}Learn more.{{/ExternalLink}}',
					{
						components: {
							ExternalLink: (
								<ExternalLink
									href={ learnMoreLink }
									children={ null }
									rel="noopener noreferrer"
									onClick={ () =>
										recordTracksEvent( 'calypso_jetpack_backup_last_faileds_learn_more_click' )
									}
								/>
							),
						},
					}
				) }
			</span>
		</div>
	);
};
