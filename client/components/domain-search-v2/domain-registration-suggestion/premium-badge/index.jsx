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
		const { restrictedPremium, domainName, translate } = this.props;
		const { text, description } = this.getPopoverText( restrictedPremium );
		const badgeClassNames = clsx( 'premium-badge', {
			'restricted-premium': restrictedPremium,
		} );

		const popoverAriaLabel = restrictedPremium
			? translate( '%(domainName)s is a restricted premium domain. Learn more', {
					args: { domainName },
					comment:
						'Accessible label for premium badge when a domain is restricted. %(domainName)s is the domain name',
			  } )
			: translate( '%(domainName)s is a premium domain. Learn more', {
					args: { domainName },
					comment:
						'Accessible label for premium badge when a domain is not restricted. %(domainName)s is the domain name',
			  } );

		return (
			<Badge className={ badgeClassNames }>
				{ text }
				<InfoPopover iconSize={ 16 } aria-label={ popoverAriaLabel }>
					{ description }
				</InfoPopover>
			</Badge>
		);
	}
}

export default localize( PremiumBadge );
