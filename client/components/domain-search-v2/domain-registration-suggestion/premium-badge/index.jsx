import { DomainSuggestionBadge } from '@automattic/domain-search';
import { localize } from 'i18n-calypso';
import { Component } from 'react';

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

		return <DomainSuggestionBadge popover={ description }>{ text }</DomainSuggestionBadge>;
	}
}

export default localize( PremiumBadge );
