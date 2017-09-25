/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SiteTools from './site-tools';
import GeneralForm from 'my-sites/site-settings/form-general';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsGeneral = ( { site } ) => {
	return (
		<div className="site-settings__main general-settings">
			<GeneralForm site={ site } />
			<SiteTools />
		</div>
	);
};

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} )
)( SiteSettingsGeneral );
