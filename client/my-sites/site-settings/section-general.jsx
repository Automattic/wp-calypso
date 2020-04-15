/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import GeneralForm from 'my-sites/site-settings/form-general';
import SiteTools from './site-tools';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsGeneral = ( { site } ) => (
	<div className="site-settings__main general-settings">
		<GeneralForm site={ site } />
		<SiteTools />
	</div>
);

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( SiteSettingsGeneral );
