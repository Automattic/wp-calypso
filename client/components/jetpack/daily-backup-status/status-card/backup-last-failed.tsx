import { ExternalLink } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useDispatch } from 'calypso/state';
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
	const dispatch = useDispatch();
	const learnMoreLink = 'https://jetpack.com/support/backup/troubleshooting-jetpack-backup/';

	const onLearnMoreClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_last_failed_learn_more_click' ) );
	}, [ dispatch ] );

	const translatedText = translate(
		"We encountered some issues with the latest backup, but don't worry! " +
			"We're using the most recent backup available. " +
			'{{ExternalLink}}Learn more.{{/ExternalLink}}',
		{
			components: {
				ExternalLink: (
					<ExternalLink href={ learnMoreLink } children={ null } onClick={ onLearnMoreClick } />
				),
			},
		}
	);

	return (
		<div className="backup-last-failed__wrapper">
			<span className="backup-last-failed__info">
				<Icon icon={ info } size={ 26 } className="icon" />
				{ translatedText }
			</span>
		</div>
	);
};
