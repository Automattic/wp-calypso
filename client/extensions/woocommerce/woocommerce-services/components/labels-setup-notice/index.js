/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import QueryLabelSettings from 'woocommerce/woocommerce-services/components/query-label-settings';
import { getSelectedSite } from 'state/ui/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	areSettingsLoaded,
	areLabelsEnabled,
	getLabelSettingsFormMeta,
	getSelectedPaymentMethodId,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import { isWcsEnabled } from 'woocommerce/state/selectors/plugins';

const LabelsSetupNotice = ( {
	site,
	wcsEnabled,
	loaded,
	enabled,
	hasLabelsPaymentMethod,
	translate,
	showNotice,
} ) => {
	if ( ! wcsEnabled ) {
		return null;
	}

	if ( ! loaded ) {
		return <QueryLabelSettings siteId={ site.ID } />;
	}

	if ( ! showNotice ) {
		return null;
	}

	if ( enabled && ! hasLabelsPaymentMethod ) {
		return (
			<Card className="labels-setup-notice is-warning">
				{ translate(
					'To begin fulfilling orders by printing your own label, add a payment method in {{a}}shipping settings{{/a}}',
					{ components: { a: <a href={ getLink( '/store/settings/shipping/:site/', site ) } /> } }
				) }
			</Card>
		);
	}

	return null;
};

export default connect( ( state ) => {
	const site = getSelectedSite( state );
	return {
		wcsEnabled: isWcsEnabled( state, site.ID ),
		site,
		loaded: areSettingsLoaded( state, site.ID ),
		enabled: areLabelsEnabled( state, site.ID ),
		hasLabelsPaymentMethod: Boolean( getSelectedPaymentMethodId( state, site.ID ) ),
		showNotice: ( getLabelSettingsFormMeta( state, site.ID ) || {} ).can_manage_payments,
	};
} )( localize( LabelsSetupNotice ) );
