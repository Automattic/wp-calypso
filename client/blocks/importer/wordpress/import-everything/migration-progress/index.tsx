import { ProgressBar } from '@automattic/components';
import { MigrationStatus } from '@automattic/data-stores';
import { Progress, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { EVERY_FIVE_SECONDS, Interval } from 'calypso/lib/interval';
import useBackupTitle from './use-backup-title';
import useRestoreTitle from './use-restore-title';

interface Props {
	status: MigrationStatus;
	fetchStatus: () => void;
	percent: number;
	siteSize?: number;
	backupMedia?: number;
	backupPosts?: number;
	backupPercent?: number;
	restorePercent?: number;
	restoreMessage?: string;
}
export const MigrationProgress = ( props: Props ) => {
	const translate = useTranslate();
	const {
		status,
		fetchStatus,
		percent,
		siteSize,
		backupMedia,
		backupPosts,
		backupPercent,
		restorePercent,
		restoreMessage,
	} = props;

	const backupTitle = useBackupTitle( backupPercent, backupMedia, backupPosts, siteSize );
	const restoreTitle = useRestoreTitle( restorePercent, restoreMessage );

	const getTitle = useCallback( () => {
		switch ( status ) {
			case MigrationStatus.NEW:
			case MigrationStatus.BACKING_UP_QUEUED:
				return translate( 'Backing up your data…' );

			case MigrationStatus.BACKING_UP:
				return backupTitle;

			case MigrationStatus.RESTORING:
				return restoreTitle;

			default:
				return '';
		}
	}, [ status, backupTitle, restoreTitle ] );

	return (
		<Progress className="onboarding-progress-simple">
			<Interval onTick={ fetchStatus } period={ EVERY_FIVE_SECONDS } />
			<div className="import__heading import__heading-center">
				<Title>{ getTitle() }</Title>
				<ProgressBar compact={ true } value={ percent ? percent : 0 } />
				<SubTitle tagName="h3">
					{ translate(
						'Feel free to close this window. We’ll email you when your new site is ready.'
					) }
				</SubTitle>
			</div>
		</Progress>
	);
};

export default MigrationProgress;
