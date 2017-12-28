/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import GeneralForm from 'client/my-sites/site-settings/form-general';
import SiteTools from './site-tools';
import { getSelectedSite } from 'client/state/ui/selectors';

const SiteSettingsGeneral = ( { site } ) => {
	return (
		<div className="site-settings__main general-settings">
			<GeneralForm site={ site } />
			<SiteTools />
		</div>
	);
};

export default connect( state => ( {
	site: getSelectedSite( state ),
} ) )( SiteSettingsGeneral );
