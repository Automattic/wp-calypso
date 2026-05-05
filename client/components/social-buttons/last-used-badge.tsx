import { useTranslate } from 'i18n-calypso';
import type { ReactNode } from 'react';

type LastUsedBadgeProps = {
	children: ReactNode;
};

const LastUsedBadge = ( { children }: LastUsedBadgeProps ) => {
	const translate = useTranslate();
	return (
		<span className="social-buttons__last-used">
			<span className="social-buttons__last-used-pill">{ translate( 'Last used' ) }</span>
			{ children }
		</span>
	);
};

export default LastUsedBadge;
