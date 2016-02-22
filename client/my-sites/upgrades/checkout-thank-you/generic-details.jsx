/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import i18n from 'lib/mixins/i18n';

const GenericDetails = ( { selectedSite } ) => {
	return (
		<ul className="checkout-thank-you__purchase-details-list">
			<Button href={ selectedSite.URL } primary>
				{ i18n.translate( 'Back to my site' ) }
			</Button>
		</ul>
	);
};

GenericDetails.propTypes = {
	selectedSite: React.PropTypes.object.isRequired
};

export default GenericDetails;
