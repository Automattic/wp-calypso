/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormFieldset from 'components/forms/form-fieldset';
import { purchaseType } from 'lib/purchases';
import GSuitePurchaseFeatures from 'my-sites/email/gsuite-purchase-features';

const GSuiteCancellationFeatures = ( { translate, purchase } ) => {
	const gsuiteDomain = purchaseType( purchase );
	const { productSlug } = purchase;
	return (
		<Fragment>
			<FormSectionHeading>{ translate( "We're sorry to see you go." ) }</FormSectionHeading>
			<FormFieldset>
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
			</FormFieldset>
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
