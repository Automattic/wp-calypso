/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import QueryJetpackPlugins from 'components/data/query-jetpack-plugins';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isRequesting, getPluginOnSite } from 'state/plugins/installed/selectors';

const AmpJetpack = ( {
	ampPluginInstalled,
	requestingPlugins,
	site,
	siteId,
	siteSlug,
	translate
} ) => {
	let linkUrl, linkText;
	if ( ampPluginInstalled && ampPluginInstalled.active ) {
		linkUrl = site.URL + '/wp-admin/customize.php?autofocus%5Bpanel%5D=amp_panel&customize_amp=1';
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

			{
				! requestingPlugins &&
				<CompactCard href={ linkUrl }>
					{ linkText }
				</CompactCard>
			}
		</div>
	);
};

export default connect(
	( state ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );

		return {
			site,
			siteId,
			ampPluginInstalled: getPluginOnSite( state, site, 'amp' ),
			requestingPlugins: isRequesting( state, siteId ),
			siteSlug: getSelectedSiteSlug( state ),
		};
	}
)( localize( AmpJetpack ) );
