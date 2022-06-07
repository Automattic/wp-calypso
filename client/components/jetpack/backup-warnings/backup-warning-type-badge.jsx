import { translate } from 'i18n-calypso';

import './style.scss';

const warningTypeText = ( warningType ) => {
	const typeMap = {
		GENERIC: translate( 'Generic' ),
		PERMISSIONS: translate( 'Permissions' ),
		CONNECTION: translate( 'Connection' ),
		TRANSIENT: translate( 'Transient' ),
		DATABASE: translate( 'Database' ),
	};

	const warningText = typeMap[ warningType ];

	return warningText ? warningText : typeMap.GENERIC;
};

const BackupWarningTypeBadge = ( { warningType } ) => {
	return (
		<div className="backup-warning-type-badge__wrapper">
			<div className="backup-warning-type-badge__content">{ warningTypeText( warningType ) }</div>
		</div>
	);
};

export default BackupWarningTypeBadge;
