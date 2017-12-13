/** @format */

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

const SettingsDisplayHeader = ( { translate, site } ) => {
	const breadcrumbs = [
		<a href={ getLink( '/store/settings/:site/', site ) }>{ translate( 'Settings' ) }</a>,
		<span>{ translate( 'Display' ) }</span>,
	];
	return (
		<div>
			<ActionHeader breadcrumbs={ breadcrumbs } />
			<SettingsNavigation activeSection="display" />
		</div>
	);
};

SettingsDisplayHeader.propTypes = {
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

export default connect( mapStateToProps )( localize( SettingsDisplayHeader ) );
