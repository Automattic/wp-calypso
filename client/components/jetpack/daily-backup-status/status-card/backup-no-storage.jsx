import { useTranslate } from 'i18n-calypso';
import cloudWarningIcon from './icons/cloud-warning.svg';

import './style.scss';

const BackupNoStorage = ( { selectedDate } ) => {
	const translate = useTranslate();
	const displayDate = selectedDate.format( 'll' );

	return (
		<>
			<div className="status-card__message-head">
				<img src={ cloudWarningIcon } alt="" role="presentation" />
				<div className="status-card__title">{ translate( 'No backup' ) }</div>
			</div>

			<div className="status-card__label">
				<p>
					{ translate( 'The backup for %(displayDate)s reached the retention or storage limit.', {
						args: { displayDate },
					} ) }
				</p>
			</div>
		</>
	);
};

export default BackupNoStorage;
