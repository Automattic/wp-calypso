import { CompactCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

const BackupWarningListHeader = () => {
	const translate = useTranslate();

	return (
		<CompactCard className="backup-warning-list-header backup-warning-list-header__wrapper">
			<div className="backup-warning-list-header__title title__type">{ translate( 'Type' ) }</div>
			<div className="backup-warning-list-header__title title__details">
				{ translate( 'Details' ) }
			</div>
		</CompactCard>
	);
};

export default BackupWarningListHeader;
