import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import './style.scss';

interface HostingBadgeProps {
	hostingName: string;
}

export const HostingBadge: FC< HostingBadgeProps > = ( { hostingName } ) => {
	const translate = useTranslate();

	return (
		<span className="migration-instructions-hosting-badge">
			{ translate( 'Hosted with %(hostingName)s', { args: { hostingName } } ) }
		</span>
	);
};
