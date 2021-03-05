/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import SettingsNavigation from '../navigation';
import ShippingSettingsSaveButton from './save-button';

const ShippingHeader = ( { onSaveSuccess, translate, site, toSave } ) => {
	const breadcrumbs = [
		<a href={ getLink( '/store/settings/:site/', site ) }>{ translate( 'Settings' ) }</a>,
		<span>{ translate( 'Shipping' ) }</span>,
	];
	return (
		<div>
			<ActionHeader breadcrumbs={ breadcrumbs }>
				<ShippingSettingsSaveButton onSaveSuccess={ onSaveSuccess } toSave={ toSave } />
			</ActionHeader>
			<SettingsNavigation activeSection="shipping" />
		</div>
	);
};

ShippingHeader.propTypes = {
	onSaveSuccess: PropTypes.func.isRequired,
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
	toSave: PropTypes.shape( {
		units: PropTypes.bool,
		shipping: PropTypes.bool,
	} ),
};

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	return {
		site,
	};
}

export default connect( mapStateToProps )( localize( ShippingHeader ) );
