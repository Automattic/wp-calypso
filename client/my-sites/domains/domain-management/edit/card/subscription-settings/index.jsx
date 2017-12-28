/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';
import purchasesPaths from 'client/me/purchases/paths';
import { type as domainTypes } from 'client/lib/domains/constants';

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
			case domainTypes.TRANSFER:
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
