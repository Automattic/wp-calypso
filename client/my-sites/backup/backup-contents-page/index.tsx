import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import ActionButtons from 'calypso/components/jetpack/daily-backup-status/action-buttons';
import cloudIcon from 'calypso/components/jetpack/daily-backup-status/status-card/icons/cloud-success.svg';
import useGetDisplayDate from 'calypso/components/jetpack/daily-backup-status/use-get-display-date';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import './style.scss';

interface OwnProps {
	rewindId: number;
}

const BackupContentsPage: FunctionComponent< OwnProps > = ( { rewindId } ) => {
	const translate = useTranslate();
	const getDisplayDate = useGetDisplayDate();
	const moment = useLocalizedMoment();
	const displayDate = getDisplayDate( moment.unix( rewindId ), false );

	return (
		<>
			<div className="main backup-contents-page">
				<Card className="card backupdaily-backup-status contents-page">
					<div className="contents-page__header">
						<div className="status-card__message-head">
							<img src={ cloudIcon } alt="" role="presentation" />
							<div className="status-card__hide-mobile">
								{ translate( 'Backup contents from:' ) }
							</div>
						</div>
						<div className="status-card__title">{ displayDate }</div>
						<ActionButtons
							disabled={ false }
							hasWarnings={ false }
							isMultiSite={ false }
							rewindId={ rewindId.toString() }
							onClickClone={ null }
						/>
					</div>
					<div className="contents-page__body"></div>
				</Card>
			</div>
		</>
	);
};

export default BackupContentsPage;
