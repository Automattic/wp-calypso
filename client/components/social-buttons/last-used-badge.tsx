import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Badge } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

type LastUsedBadgeProps = {
	method: string;
	children: ReactNode;
};

const LastUsedBadge = ( { method, children }: LastUsedBadgeProps ) => {
	const translate = useTranslate();

	useEffect( () => {
		recordTracksEvent( 'calypso_login_last_used_badge_view', { method } );
	}, [ method ] );

	return (
		<span className="social-buttons__last-used">
			<Badge intent="informational" className="social-buttons__last-used-pill">
				{ translate( 'Last used' ) }
			</Badge>
			{ children }
		</span>
	);
};

export default LastUsedBadge;
