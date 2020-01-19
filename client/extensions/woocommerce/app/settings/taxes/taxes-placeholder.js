/**
 * External dependencies
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { getLink } from 'woocommerce/lib/nav-utils';
import SettingsNavigation from '../navigation';

const SettingsTaxesPlaceholder = ( { siteSlug, translate } ) => {
	const breadcrumbs = [
		<a href={ getLink( '/store/settings/:site/', { slug: siteSlug } ) }>
			{ translate( 'Settings' ) }
		</a>,
		<span>{ translate( 'Taxes' ) }</span>,
	];

	return (
		<div>
			<ActionHeader breadcrumbs={ breadcrumbs } />
			<SettingsNavigation activeSection="taxes" />
			<div className="taxes__placeholder card" />
		</div>
	);
};

SettingsTaxesPlaceholder.propTypes = {
	siteSlug: PropTypes.string.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( SettingsTaxesPlaceholder );
