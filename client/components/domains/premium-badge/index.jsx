/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';
import InfoPopover from 'components/info-popover';

import './style.scss';

class PremiumBadge extends React.Component {
	render() {
		const { translate } = this.props;
		return (
			<Badge className="premium-badge">
				{ translate( 'Premium domain' ) }
				<InfoPopover iconSize="16">
					{ translate( 'Premium domain names are short and easy to remember' ) }
				</InfoPopover>
			</Badge>
		);
	}
}

export default localize( PremiumBadge );
