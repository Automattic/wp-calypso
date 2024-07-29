import { Badge } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import InfoPopover from 'calypso/components/info-popover';

import './style.scss';

class PremiumBadge extends Component {
	getPopoverText( restrictedPremium ) {
		const { translate } = this.props;
		if ( restrictedPremium ) {
			return {
				text: translate( 'Restricted premium' ),
				description: translate(
					"This premium domain is currently not available at WordPress.com. Please contact support if you're interested in this domain."
				),
			};
		}
		return {
			text: translate( 'Premium domain' ),
			description: translate(
				'Premium domain names are usually short, easy to remember, contain popular keywords, or some combination of these factors. Premium domain names are not eligible for purchase using the free plan domain credit.'
			),
		};
	}

	render() {
		const { restrictedPremium } = this.props;
		const { text, description } = this.getPopoverText( restrictedPremium );
		const badgeClassNames = clsx( 'premium-badge', {
			'restricted-premium': restrictedPremium,
		} );
		return (
			<Badge className={ badgeClassNames }>
				{ text }
				<InfoPopover iconSize={ 16 }>{ description }</InfoPopover>
			</Badge>
		);
	}
}

export default localize( PremiumBadge );
