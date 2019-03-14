/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import GSuitePurchaseFeatures from 'my-sites/email/gsuite-purchase-features';
import { recordTracksEvent } from 'state/analytics/actions';
import { purchaseType } from 'lib/purchases';

const GSuiteCancellationFeatures = ( { translate, purchase } ) => {
	const gsuiteDomain = purchaseType( purchase );
	const { productSlug } = purchase;
	return (
		<Fragment>
			<CardHeading tagName="h3" size={ 24 }>
				{ translate( "We're sorry to see you go." ) }
			</CardHeading>
			<p>
				{ translate(
					'Are you sure you want to cancel and remove G Suite from {{siteName/}}? ' +
						"Here's what you'll be missing:",
					{ components: { siteName: <em>{ gsuiteDomain }</em> } }
				) }
			</p>
			<GSuitePurchaseFeatures
				productSlug={ productSlug }
				domainName={ gsuiteDomain }
				type={ 'list' }
			/>
		</Fragment>
	);
};

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
