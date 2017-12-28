/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'client/components/card/compact';
import SectionHeader from 'client/components/section-header';
import QueryJetpackPlugins from 'client/components/data/query-jetpack-plugins';
import { addQueryArgs } from 'client/lib/url';
import { getCustomizerUrl, getSiteSlug } from 'client/state/sites/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import { isRequesting, getPluginOnSite } from 'client/state/plugins/installed/selectors';

const AmpJetpack = ( {
	ampPluginInstalled,
	customizerAmpPanelUrl,
	requestingPlugins,
	siteId,
	siteSlug,
	translate,
} ) => {
	let linkUrl, linkText;
	if ( ampPluginInstalled && ampPluginInstalled.active ) {
		linkUrl = customizerAmpPanelUrl;
		linkText = translate( 'Edit the design of your Accelerated Mobile Pages' );
	} else {
		linkUrl = '/plugins/amp/' + siteSlug;
		if ( ampPluginInstalled ) {
			linkText = translate( 'Activate the AMP plugin' );
		} else {
			linkText = translate( 'Install the AMP plugin' );
		}
	}

	return (
		<div className="amp__jetpack">
			{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }

			<SectionHeader label={ translate( 'Accelerated Mobile Pages (AMP)' ) } />

			<CompactCard>
				<p>
					{ translate(
						'AMP enables the creation of websites and ads that load near instantly, ' +
							'giving site visitors a smooth, more engaging experience on mobile and desktop.'
					) }
				</p>
			</CompactCard>

			{ ! requestingPlugins && <CompactCard href={ linkUrl }>{ linkText }</CompactCard> }
		</div>
	);
};

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const customizerUrl = getCustomizerUrl( state, siteId );
	const customizerAmpPanelUrl = addQueryArgs(
		{
			'autofocus[panel]': 'amp_panel',
			customize_amp: 1,
		},
		customizerUrl
	);

	return {
		siteId,
		ampPluginInstalled: getPluginOnSite( state, siteId, 'amp' ),
		customizerAmpPanelUrl,
		requestingPlugins: isRequesting( state, siteId ),
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( AmpJetpack ) );
