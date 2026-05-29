import { Badge } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import type { ReactNode } from 'react';

type LastUsedBadgeProps = {
	children: ReactNode;
};

// Visual-only "Last used" pill wrapper. Impression tracking lives in
// LoginMethodImpression so the event can fire for every method, badged or not.
const LastUsedBadge = ( { children }: LastUsedBadgeProps ) => {
	const translate = useTranslate();

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
