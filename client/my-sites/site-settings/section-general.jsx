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
import config from 'config';
import { getSelectedSite } from 'state/ui/selectors';

const SiteSettingsGeneral = ( {
	hasLoadedSitePurchasesFromServer,
	site,
	sitePurchases
} ) => {
	return (
		<div className="site-settings__main general-settings">
			<GeneralForm site={ site } />

			{ config.isEnabled( 'manage/site-settings/delete-site' ) && site && ! site.jetpack && ! site.is_vip &&
				<SiteTools
					site={ site }
					sitePurchases={ sitePurchases }
					hasLoadedSitePurchasesFromServer={ hasLoadedSitePurchasesFromServer }
				/>
			}
		</div>
	);
};

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
	} )
)( SiteSettingsGeneral );
