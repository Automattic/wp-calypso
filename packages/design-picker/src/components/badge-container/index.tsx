import { PremiumBadge } from '@automattic/components';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	badgeType?: 'premium' | 'none';
	isPremiumThemeAvailable?: boolean;
}

const BadgeContainer: FunctionComponent< Props > = ( {
	badgeType = 'none',
	isPremiumThemeAvailable = false,
} ) => {
	function getBadge() {
		switch ( badgeType ) {
			case 'premium':
				return <PremiumBadge isPremiumThemeAvailable={ isPremiumThemeAvailable } />;
			case 'none':
				return null;
			default:
				throw new Error( 'Invalid badge type!' );
		}
	}

	return <div className="badge-container">{ getBadge() }</div>;
};

export default BadgeContainer;
