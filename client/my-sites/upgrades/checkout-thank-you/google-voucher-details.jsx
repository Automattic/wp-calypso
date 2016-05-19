
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import PurchaseDetails from 'components/purchase-detail';

const GoogleVoucherDetails = ( { selectedSite, step } ) => {
	const renderStepZero = () => {
		return (
			<PurchaseDetails
				id="google-ad-credit"
				icon="tag"
				title={ i18n.translate( 'Google AdWords credit' ) }
				description={ i18n.translate( 'Use your {{strong}}$100{{/strong}} in credit with Google to bring the right traffic to your most important Posts and Pages.', {
					components: {
						strong: <strong />
					}
				} ) }
				buttonText={ i18n.translate( 'Generate Code' ) }
				href={ '/domains/add/' + selectedSite.slug }
				info={ i18n.translate( 'Offer valid in US and Canada after spending the first $25 on Google AdWords.' ) } />
		);
	};

	switch ( step ) {
		case 0:
			return renderStepZero();
			break;
	}
};

GoogleVoucherDetails.propTypes = {
	selectedSite: React.PropTypes.oneOfType( [
		React.PropTypes.bool,
		React.PropTypes.object
	] ).isRequired
};

export default GoogleVoucherDetails;
