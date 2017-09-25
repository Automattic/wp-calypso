/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { type as domainTypes } from 'lib/domains/constants';
import purchasesPaths from 'me/purchases/paths';

class SubscriptionSettings extends React.Component {
	static propTypes = {
		type: PropTypes.string.isRequired,
		siteSlug: PropTypes.string,
		subscriptionId: PropTypes.string,
		onClick: PropTypes.func.isRequired,
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
				onClick={ this.props.onClick }>
				{ this.props.translate( 'Payment Settings' ) }
			</Button>
		);
	}
}

export default localize( SubscriptionSettings );
