import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import StatusBadge from 'calypso/a8c-for-agencies/components/step-section-item/status-badge';

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
