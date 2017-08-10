/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import purchasesPaths from 'me/purchases/paths';
import { type as domainTypes } from 'lib/domains/constants';

class SubscriptionSettings extends React.Component {
	static propTypes = {
		type: React.PropTypes.string.isRequired,
		siteSlug: React.PropTypes.string,
		subscriptionId: React.PropTypes.string,
		onClick: React.PropTypes.func.isRequired,
	};

	getLink() {
		switch ( this.props.type ) {
			case domainTypes.MAPPED:
			case domainTypes.REGISTERED:
			case domainTypes.SITE_REDIRECT:
				return purchasesPaths.managePurchase( this.props.siteSlug, this.props.subscriptionId );

			default:
				return purchasesPaths.purchasesRoot();
		}
	}

	render() {
		return (
			<Button
				className="subscription-settings"
				href={ this.getLink() }
				onClick={ this.props.onClick }
			>
				{ this.props.translate( 'Payment Settings' ) }
			</Button>
		);
	}
}

export default localize( SubscriptionSettings );
