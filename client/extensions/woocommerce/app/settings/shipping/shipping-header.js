/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import SettingsNavigation from '../navigation';
import ShippingSettingsFinishedButton from './finished-button';

const ShippingHeader = ( { translate, site } ) => {
	const breadcrumbs = [
		( <a href={ getLink( '/store/settings/:site/', site ) }>{ translate( 'Settings' ) }</a> ),
		( <span>{ translate( 'Shipping' ) }</span> ),
	];
	return (
		<div>
			<ActionHeader breadcrumbs={ breadcrumbs }>
				<ShippingSettingsFinishedButton />
			</ActionHeader>
			<SettingsNavigation activeSection="shipping" />
		</div>
	);
};

ShippingHeader.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
};

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
}

export default connect( mapStateToProps )( localize( ShippingHeader ) );
