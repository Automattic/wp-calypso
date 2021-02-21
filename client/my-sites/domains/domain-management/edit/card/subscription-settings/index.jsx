/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { managePurchase, purchasesRoot } from 'calypso/me/purchases/paths';
import { type as domainTypes } from 'calypso/lib/domains/constants';

/**
 * Style dependencies
 */
import './style.scss';

class SubscriptionSettings extends React.Component {
	static propTypes = {
		type: PropTypes.string.isRequired,
		compact: PropTypes.bool,
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
				return managePurchase( this.props.siteSlug, this.props.subscriptionId );

			default:
				return purchasesRoot;
		}
	}

	render() {
		return (
			<Button
				compact={ this.props.compact }
				className="subscription-settings"
				href={ this.getLink() }
				onClick={ this.props.onClick }
			>
				{ this.props.translate( 'Go to payment settings' ) }
			</Button>
		);
	}
}

export default localize( SubscriptionSettings );
