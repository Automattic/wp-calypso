/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import GSuitePurchaseFeatures from 'my-sites/email/gsuite-purchase-features';
import { recordTracksEvent } from 'state/analytics/actions';
import { purchaseType } from 'lib/purchases';

class GSuiteCancellationFeatures extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_features_view' );
	}

	render() {
		const { purchase, translate } = this.props;
		const gsuiteDomain = purchaseType( purchase );
		const { productSlug } = purchase;
		return (
			<div className="gsuite-cancel-purchase-dialog__features">
				<CardHeading tagName="h3" size={ 24 }>
					{ translate( "Are you sure? Here's what you'll be missing:" ) }
				</CardHeading>
				<p>
					{ translate(
						'If you cancel and remove G Suite from {{siteName/}} you will lose access to the following: ',
						{ components: { siteName: <em>{ gsuiteDomain }</em> } }
					) }
				</p>
				<GSuitePurchaseFeatures
					productSlug={ productSlug }
					domainName={ gsuiteDomain }
					type={ 'list' }
				/>
			</div>
		);
	}
}

GSuiteCancellationFeatures.propTypes = {
	purchase: PropTypes.object.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( GSuiteCancellationFeatures ) );
