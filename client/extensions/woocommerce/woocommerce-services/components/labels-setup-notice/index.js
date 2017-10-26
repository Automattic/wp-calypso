/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import config from 'config';
import QueryLabelSettings from 'woocommerce/woocommerce-services/components/query-label-settings';
import { getSelectedSite } from 'state/ui/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	areSettingsLoaded,
	areLabelsEnabled,
	getSelectedPaymentMethodId,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';

const wcsEnabled = config.isEnabled( 'woocommerce/extension-wcservices' );

const LabelsSetupNotice = ( { site, loaded, enabled, hasLabelsPaymentMethod, translate } ) => {
	if ( ! wcsEnabled ) {
		return null;
	}

	if ( ! loaded ) {
		return <QueryLabelSettings siteId={ site.ID } />;
	}

	if ( enabled && ! hasLabelsPaymentMethod ) {
		return (
			<Card className="labels-setup-notice is-warning">
				{ translate(
					'To begin fulfilling orders by printing your own label, add a payment method in {{a}}Shipping Settings{{/a}}',
					{ components: { a: <a href={ getLink( '/store/settings/shipping/:site/', site ) } /> } }
				) }
			</Card>
		);
	}

	return null;
};

export default connect( state => {
	const site = getSelectedSite( state );
	return {
		site,
		loaded: areSettingsLoaded( state, site.ID ),
		enabled: areLabelsEnabled( state, site.ID ),
		hasLabelsPaymentMethod: Boolean( getSelectedPaymentMethodId( state, site.ID ) ),
	};
} )( localize( LabelsSetupNotice ) );
