import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import cloudWarningIcon from './icons/cloud-warning.svg';

import './style.scss';

const BackupNoStorage = ( { selectedDate } ) => {
	const translate = useTranslate();
	const displayDate = selectedDate.format( 'll' );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const settingsPathLinkTarget = settingsPath( siteSlug );

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
				<p>
					{ translate( 'Check your {{a}}settings{{/a}} to manage your storage.', {
						components: {
							a: <a href={ settingsPathLinkTarget } />,
						},
					} ) }
				</p>
			</div>
		</>
	);
};

export default BackupNoStorage;
