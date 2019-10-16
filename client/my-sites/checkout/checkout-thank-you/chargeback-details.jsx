/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { newPost } from 'lib/paths';
import PurchaseDetail from 'components/purchase-detail';

const ChargebackDetails = ( { selectedSite } ) => {
	return (
		<PurchaseDetail
			icon="create"
			title={ translate( 'Get back to posting' ) }
			description={ translate( 'You can now use the full features of your site, without limits.' ) }
			buttonText={ translate( 'Write a Post' ) }
			href={ newPost( selectedSite ) }
		/>
	);
};

ChargebackDetails.propTypes = {
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
};

export default ChargebackDetails;
