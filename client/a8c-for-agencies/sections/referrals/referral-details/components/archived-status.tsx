import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import StatusBadge from '../../common/step-section-item/status-badge';

export default function ArchivedStatus(): ReactNode {
	const translate = useTranslate();

	return (
		<StatusBadge
			statusProps={ {
				children: translate( 'Archived' ),
				type: 'info',
			} }
		/>
	);
}
